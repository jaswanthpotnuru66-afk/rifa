import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { z } from 'zod';
import xss from 'xss';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';


dotenv.config();

// Global Error Handlers for Debugging
process.on('uncaughtException', (err) => {
    console.error('CRITICAL: Uncaught Exception:', err.message);
    console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
});


const app = express();
const PORT = process.env.PORT || 3001;

// SECURITY: Use environment variable for JWT secret. 
// Fatal error if missing in production to prevent fallback to weak keys.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET environment variable is missing!');
    process.exit(1);
}
const ACTUAL_JWT_SECRET = JWT_SECRET || 'rifa_dev_fallback_secret_only_for_local_dev';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

// --- OWASP SECURITY HEADERS ---
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for local dev to avoid issues
    crossOriginResourcePolicy: { policy: "cross-origin" } // Allow cross-origin resources
}));

// --- RATE LIMITING ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Error handling middleware for body-parser
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        console.error(`Payload too large: ${err.length} bytes (limit: ${err.limit})`);
        return res.status(413).json({ 
            error: 'Payload too large', 
            details: `The request body exceeds the limit of ${err.limit / (1024 * 1024)}MB. Please use smaller images.`
        });
    }
    next(err);
});

// Log all requests with body for debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length) {
        // Obfuscate passwords and truncate large bodies in logs
        try {
            const logBody = { ...req.body };
            if (logBody.password) logBody.password = '********';
            
            // Truncate large arrays or strings (like images)
            if (logBody.images && Array.isArray(logBody.images)) {
                logBody.images = [`<${logBody.images.length} images truncated>`];
            }
            if (logBody.img) logBody.img = '<image truncated>';
            if (logBody.process_img) logBody.process_img = '<banner truncated>';

            const bodyStr = JSON.stringify(logBody, null, 2);
            console.log('Body:', bodyStr.length > 2000 ? bodyStr.substring(0, 2000) + '...' : bodyStr);
        } catch (e) {
            console.log('Body: <Unable to stringify body>');
        }
    }
    next();
});

// --- SECURITY HELPERS ---

/**
 * Recursively sanitizes string inputs to prevent XSS.
 */
const sanitize = (val) => {
    if (typeof val === 'string') {
        // Skip XSS for base64 images to avoid performance issues and corruption
        if (val.startsWith('data:image/') && val.includes(';base64,')) {
            return val;
        }
        return xss(val.trim());
    }
    if (Array.isArray(val)) return val.map(sanitize);
    if (typeof val === 'object' && val !== null) {
        const cleaned = {};
        for (const key in val) cleaned[key] = sanitize(val[key]);
        return cleaned;
    }
    return val;
};

/**
 * Generates a URL-friendly slug from a string.
 */
const slugify = (text) => {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

/**
 * Middleware to validate request body against a Zod schema.
 * Rejects unexpected fields and handles sanitization.
 */
const validate = (schema) => (req, res, next) => {
    try {
        // Normalize phone number if present (strip spaces, dashes, etc.)
        if (req.body && typeof req.body.phone === 'string') {
            req.body.phone = req.body.phone.replace(/[^\d+]/g, '');
        }
        const validated = schema.parse(req.body);
        req.body = sanitize(validated);
        next();
    } catch (error) {
        console.error('Validation Error:', error);
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: error.errors ? error.errors.map(e => `${e.path.join('.')}: ${e.message}`) : [error.message]
        });
    }
};

/**
 * Middleware to verify JWT token and attach user to request.
 */
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    
    try {
        const decoded = jwt.verify(token, ACTUAL_JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

/**
 * Middleware to restrict access based on user roles.
 */
const authorize = (roles = []) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied: Insufficient permissions' });
    }
    next();
};

// --- VALIDATION SCHEMAS ---

const RegisterSchema = z.object({
    email: z.string().email().max(100),
    password: z.string().min(8).max(100),
    fullName: z.string().min(2).max(100),
    phone: z.string().min(10).max(15), // Normalized to 10-15 digits
    location: z.string().max(200).optional()
}).strict();

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
}).strict();

const ApplicationSchema = z.object({
    creator_name: z.string().min(2).max(100),
    brand_name: z.string().max(100),
    email: z.string().email(),
    contact: z.string().max(20),
    location: z.string().max(200),
    shop_slug: z.string().regex(/^[a-z0-9-]+$/).max(50),
    pan_number: z.string().length(10).optional(),
    bank_account: z.string().min(8).max(20).optional(),
    ifsc_code: z.string().max(15).optional(),
    home_region: z.string().max(100).optional(),
    primary_craft_category: z.string().max(50).optional(),
    craft_origin_story: z.string().max(2000).optional(),
    shop_logo_url: z.string().url().optional(),
}).strict();

const ProductSchema = z.object({
    name: z.string().min(2).max(200),
    price: z.number().positive().max(1000000),
    original_price: z.number().nullable().optional(),
    description: z.string().max(2000),
    category: z.string().max(50),
    images: z.array(z.string()).optional(),
    tag: z.string().max(50).optional(),
    details: z.object({
        specFields: z.array(z.any()).optional(),
        processingTime: z.number().optional(),
        dimensions: z.object({
            l: z.any().optional(),
            w: z.any().optional(),
            h: z.any().optional()
        }).optional(),
        weight: z.any().optional(),
        stateOfOrigin: z.string().optional()
    }).optional(),
    is_custom: z.boolean().optional(),
    is_ready: z.boolean().optional(),
    is_natural: z.boolean().optional(),
    status: z.string().optional()
});

const AddressSchema = z.object({
    id: z.string().uuid().optional(),
    label: z.string().max(50),
    address_line1: z.string().max(200),
    address_line2: z.string().max(200).optional(),
    city: z.string().max(100),
    state: z.string().max(100),
    pincode: z.string().transform(v => v.replace(/\s+/g, '')).refine(v => /^\d{6}$/.test(v), 'Invalid PIN code'),
    is_default: z.boolean().optional()
}).passthrough();

const CartItemSchema = z.object({
    product_id: z.string().max(255), // Support slugs or UUIDs
    product_name: z.string().max(200),
    price: z.number().nonnegative(),
    quantity: z.number().int().positive().max(50),
    image_url: z.string().optional(), // Allow local paths or URLs
    artisan_id: z.string().max(255).optional().nullable(), // Allow null or missing
    user_id: z.string().uuid().optional() // Attached by backend
});

const OrderSchema = z.object({
    items: z.array(CartItemSchema).min(1),
    address: AddressSchema,
    paymentMethod: z.enum(['upi', 'card', 'cod']),
    totalAmount: z.number().positive(),
    isGifting: z.boolean(),
    giftMessage: z.string().max(500).optional(),
    user_id: z.string().uuid().optional()
}).strict();


// --- AUTH ROUTES ---

app.post('/api/auth/register', authLimiter, validate(RegisterSchema), async (req, res) => {
    try {
        const { email, password, fullName, phone, location } = req.body;

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // 1. Create user
        const { data: user, error } = await supabase
            .from('users')
            .insert([{ email, password_hash: passwordHash, full_name: fullName, mobile_number: phone, location, addresses: [] }])
            .select().maybeSingle();
        if (error) throw error;


        // 2. Check if there's an approved artisan profile for this email
        const { data: pendingArtisan } = await supabase.from('artisans').select('*').eq('email', email).maybeSingle();
        
        let finalRole = user.role;
        if (pendingArtisan) {
            console.log(`[Auth] Auto-linking artisan profile for: ${email}`);
            await supabase.from('artisans').update({ user_id: user.id }).eq('id', pendingArtisan.id);
            await supabase.from('users').update({ role: 'artisan' }).eq('id', user.id);
            finalRole = 'artisan';
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: finalRole }, ACTUAL_JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({ user: { ...user, role: finalRole }, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/login', authLimiter, validate(LoginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check Admin Table FIRST (Prioritize administrative access)
        const { data: admin } = await supabase.from('admins').select('*').eq('email', email).maybeSingle();
        if (admin) {
            const isHashed = admin.password.startsWith('$2');
            const isValid = isHashed ? await bcrypt.compare(password, admin.password) : password === admin.password;
            
            console.log(`[AUTH] Admin login attempt for ${email}. Found: true, isHashed: ${isHashed}, isValid: ${isValid}`);
            
            if (isValid) {
                const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, ACTUAL_JWT_SECRET, { expiresIn: '12h' });
                return res.json({ user: admin, token, type: 'admin' });
            }
        } else {
            console.log(`[AUTH] Admin login attempt for ${email}. Found: false`);
        }
        
        // 2. Check Standard Users Table
        const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
        if (user && await bcrypt.compare(password, user.password_hash)) {
            const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, ACTUAL_JWT_SECRET, { expiresIn: '24h' });
            return res.json({ user, token, type: user.role });
        }
        
        res.status(401).json({ error: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PASSWORD RESET ROUTES ---

// Verify email for reset
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        const { data: user } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
        if (!user) return res.status(404).json({ error: 'No account found with this email' });
        
        return res.json({ success: true, message: 'Account verified' });
    } catch (error) {
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Direct Reset (Dev only)
app.post('/api/auth/reset-password-direct', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json({ error: 'Email and password required' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const { error } = await supabase
            .from('users')
            .update({ password_hash: hashedPassword })
            .eq('email', email);

        if (error) throw error;
        
        console.log(`[AUTH] Direct password reset successful for: ${email}`);
        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset password' });
    }
});


app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const { data: user, error } = await supabase.from('users').select('*').eq('id', req.user.id).maybeSingle();
        if (error || !user) throw new Error('User not found');
        res.json(user);
    } catch (error) {
        res.status(401).json({ error: 'Invalid session' });
    }
});

app.post('/api/auth/me', authenticate, async (req, res) => {
    try {
        const { full_name, phone, location, addresses, avatar_url } = req.body;
        const updateData = {};
        if (full_name !== undefined) updateData.full_name = sanitize(full_name);
        if (phone !== undefined) updateData.mobile_number = sanitize(phone);
        if (location !== undefined) updateData.location = sanitize(location);
        if (addresses !== undefined) updateData.addresses = addresses; // Addresses are complex, sanitize carefully if needed
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url; // Don't sanitize base64 images
        
        const { data, error } = await supabase.from('users').update(updateData).eq('id', req.user.id).select().maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADDRESS ROUTES (Centralized in users table) ---


app.get('/api/addresses', authenticate, async (req, res) => {
    const { user_id } = req.query;
    if (!user_id || user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    try {
        const { data: user, error } = await supabase.from('users').select('addresses').eq('id', user_id).maybeSingle();
        if (error) throw error;
        if (!user) return res.json([]);
        res.json(user.addresses || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/addresses', authenticate, validate(AddressSchema), async (req, res) => {
    const { user_id } = req.body;
    // user_id in body must match authenticated user
    const finalUserId = req.user.id; 
    try {
        const { data: user, error: fetchError } = await supabase.from('users').select('addresses').eq('id', finalUserId).maybeSingle();
        if (fetchError) throw fetchError;
        if (!user) return res.status(404).json({ error: 'User profile not found' });
        
        const currentAddresses = user.addresses || [];
        const newAddress = { id: crypto.randomUUID(), ...req.body, created_at: new Date().toISOString() };
        
        if (newAddress.is_default) currentAddresses.forEach(a => a.is_default = false);
        if (currentAddresses.length === 0) newAddress.is_default = true;
        
        const updatedAddresses = [...currentAddresses, newAddress];
        const { data, error: updateError } = await supabase.from('users').update({ addresses: updatedAddresses }).eq('id', finalUserId).select().maybeSingle();
        if (updateError) throw updateError;
        res.status(201).json(newAddress);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/addresses/:id', authenticate, async (req, res) => {
    const { user_id } = req.query;
    const { id } = req.params;
    if (!user_id || user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    try {
        const { data: user, error: fetchError } = await supabase.from('users').select('addresses').eq('id', user_id).maybeSingle();
        if (fetchError) throw fetchError;
        if (!user) return res.status(404).json({ error: 'User profile not found' });
        const updatedAddresses = (user.addresses || []).filter(a => a.id !== id);
        const { error: updateError } = await supabase.from('users').update({ addresses: updatedAddresses }).eq('id', user_id);
        if (updateError) throw updateError;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PRODUCT & ARTISAN ROUTES ---

app.get('/api/products', async (req, res) => {
    try {
        const { limit, category } = req.query;
        let query = supabase.from('products').select('*').eq('status', 'active');
        
        if (category) query = query.ilike('category', category);
        if (limit) query = query.limit(Number(limit));
        
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { data, error } = await supabase.from('products').select('*, artisans(*)').eq('id', req.params.id).maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.get('/api/artisans', async (req, res) => {
    try {
        const { limit } = req.query;
        let query = supabase.from('artisans').select('*').order('product_count', { ascending: false });
        
        if (limit) query = query.limit(Number(limit));
        
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/artisans/:id', async (req, res) => {
    try {
        const { data: artisan, error: artisanError } = await supabase.from('artisans').select('*').eq('id', req.params.id).maybeSingle();
        if (artisanError || !artisan) throw new Error('Artisan not found');

        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .eq('artisan_id', artisan.id)
            .eq('status', 'active');
            
        res.json({
            ...artisan,
            products: products || []
        });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// --- GLOBAL DATA ---

app.get('/api/promotions', async (req, res) => {
    try {
        const { data, error } = await supabase.from('promotions').select('*').eq('is_active', true);
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const { data, error } = await supabase.from('categories').select('*').order('name');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/gallery', async (req, res) => {
    try {
        const { data, error } = await supabase.from('gallery_items').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/concierge/questions', async (req, res) => {
    try {
        const { data, error } = await supabase.from('concierge_questions').select('*').order('step_number');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- CART & ORDERS ---

app.get('/api/cart', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase.from('cart_items').select('*').eq('user_id', req.user.id);
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/cart', authenticate, validate(CartItemSchema), async (req, res) => {
    try {
        // Enforce user_id
        const item = { ...req.body, user_id: req.user.id };
        const { data, error } = await supabase.from('cart_items').insert([item]).select().maybeSingle();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.delete('/api/cart/:id', authenticate, async (req, res) => {
    try {
        // Ensure user can only delete their own cart items
        const { error } = await supabase.from('cart_items').delete().eq('id', req.params.id).eq('user_id', req.user.id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/orders', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase.from('orders').select('*, order_items(*)').eq('user_id', req.user.id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', authenticate, validate(OrderSchema), async (req, res) => {
    const { items, address, paymentMethod, totalAmount, isGifting, giftMessage } = req.body;
    console.log('--- NEW ORDER ATTEMPT ---');
    console.log('Items:', items.map(i => ({ name: i.product_name, artisan: i.artisan_id })));
    const user_id = req.user.id;
    const artisan_id = items[0]?.artisan_id; // Store primary artisan for admin dashboard filtering
    const payment_status = paymentMethod === 'cod' ? 'pending' : 'completed';
    try {
        const { data: order, error: orderError } = await supabase.from('orders').insert([{
            user_id, total_amount: totalAmount, payment_method: paymentMethod, shipping_address: address,
            is_gifting: isGifting, gift_message: giftMessage, status: 'confirmed', payment_status,
            artisan_id
        }]).select().maybeSingle();
        if (orderError) throw orderError;
        
        const orderItems = items.map(item => ({
            order_id: order.id, 
            product_id: item.product_id, 
            product_name: sanitize(item.product_name),
            price: item.price, 
            quantity: item.quantity, 
            image_url: item.image_url,
            artisan_id: item.artisan_id
        }));
        
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/user/wishlist', authenticate, async (req, res) => {
    try {
        const { data, error } = await supabase.from('wishlist').select('*').eq('user_id', req.user.id);
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/user/wishlist', authenticate, async (req, res) => {
    try {
        const { product_id, product_name, price, image_url, category, artisan_id } = req.body;
        
        // Check if already in wishlist
        const { data: existing } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', req.user.id)
            .eq('product_id', product_id)
            .maybeSingle();
            
        if (existing) {
            return res.json(existing);
        }

        const { data, error } = await supabase.from('wishlist').insert({
            user_id: req.user.id,
            product_id,
            product_name,
            price,
            image_url,
            category,
            artisan_id
        }).select().single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/user/wishlist/:id', authenticate, async (req, res) => {
    try {
        const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.user.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ARTISAN SPECIFIC ROUTES ---

app.get('/api/artisan/dashboard-stats', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('*').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

        const { data: items } = await supabase.from('order_items').select('price, quantity, created_at, orders(status)').eq('artisan_id', artisan.id);
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayRevenue = (items || []).filter(i => new Date(i.created_at) >= today).reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);
        const activeOrdersCount = (items || []).filter(i => i.orders && !['delivered', 'cancelled'].includes(i.orders.status)).length;
        const { data: listings } = await supabase.from('products').select('status').eq('artisan_id', artisan.id);
        const activeListings = (listings || []).filter(l => l.status === 'active' || !l.status).length;
        const pendingListings = (listings || []).filter(l => l.status === 'pending').length;

        res.json({
            artisan,
            stats: {
                todayRevenue: `₹${todayRevenue.toLocaleString()}`,
                activeOrdersCount,
                pendingProofsCount: 0,
                shopRating: '4.8 ★',
                activeListings,
                pendingListings,
                listingsCount: listings?.length || 0,
                monthlyGross: `₹${((items || []).reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0)).toLocaleString()}`
            }
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/orders', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

        const { data: orders, error } = await supabase.from('order_items').select('*, orders(*)').eq('artisan_id', artisan.id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(orders || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/orders/:id', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan profile not found' });

        const { data: items, error } = await supabase.from('order_items')
            .select('*, orders(*)')
            .eq('order_id', req.params.id)
            .eq('artisan_id', artisan.id);
            
        if (error) throw error;
        if (!items || items.length === 0) return res.status(404).json({ error: 'Order not found or no items for this artisan' });

        res.json({
            items,
            order: items[0].orders
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/products', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });

        const { data, error } = await supabase.from('products').select('*').eq('artisan_id', artisan.id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/artisan/profile', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { name, location, specialty, story, img, process_img, tags, quote, pincode } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = sanitize(name);
        if (location !== undefined) updateData.location = sanitize(location);
        if (specialty !== undefined) updateData.specialty = specialty;
        if (story !== undefined) updateData.story = sanitize(story);
        if (img !== undefined) updateData.img = img; // Logo (Base64)
        if (process_img !== undefined) updateData.process_img = process_img; // Banner (Base64)
        if (tags !== undefined) updateData.tags = tags;
        if (quote !== undefined) updateData.quote = sanitize(quote);
        if (pincode !== undefined) updateData.pincode = sanitize(pincode);

        const { data, error } = await supabase.from('artisans').update(updateData).eq('user_id', req.user.id).select().maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/artisan/products', authenticate, authorize(['artisan']), validate(ProductSchema), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });

        const productData = { 
            ...req.body, 
            id: `${slugify(req.body.name)}-${Math.random().toString(36).substr(2, 5)}`,
            artisan_id: artisan.id,
            status: 'pending' // Enforce pending status for new products
        };

        // Schema Compatibility: The database expects 'details' as an array of strings
        if (productData.details && typeof productData.details === 'object' && !Array.isArray(productData.details)) {
            const detailsArray = [];
            const d = productData.details;
            if (d.stateOfOrigin) detailsArray.push(`Origin: ${d.stateOfOrigin}`);
            if (d.processingTime) detailsArray.push(`Processing Time: ${d.processingTime} days`);
            if (d.weight) detailsArray.push(`Weight: ${d.weight}g`);
            if (d.dimensions && d.dimensions.l) {
                detailsArray.push(`Dimensions: ${d.dimensions.l}x${d.dimensions.w}x${d.dimensions.h} cm`);
            }
            if (d.specFields && Array.isArray(d.specFields)) {
                d.specFields.forEach((f) => {
                    if (f.label) detailsArray.push(`${f.label}: ${f.type || 'Custom'}`);
                });
            }
            productData.details = detailsArray;
        }

        const { data, error } = await supabase.from('products').insert([productData]).select().maybeSingle();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) { 
        console.error('Error creating product:', error);
        res.status(400).json({ error: error.message }); 
    }
});

app.delete('/api/artisan/products/:id', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });

        const { error } = await supabase.from('products').delete().eq('id', req.params.id).eq('artisan_id', artisan.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ADMIN OPS ROUTES ---

app.get('/api/admin/applications', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('creator_applications').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/applications/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
    const { id } = req.params;
    const { admin_notes } = req.body;
    console.log(`[Admin] Approving application: ${id}`);
    try {
        // 1. Get application detail
        const { data: app, error: appError } = await supabase.from('creator_applications').select('*').eq('id', id).maybeSingle();
        if (appError || !app) throw new Error('Application not found');
        console.log(`[Admin] Found application for: ${app.email}`);

        // 2. Find user by email (Optional at this stage)
        const { data: user } = await supabase.from('users').select('*').eq('email', app.email).maybeSingle();
        
        if (user) {
            console.log(`[Admin] User account exists, updating role to artisan.`);
            await supabase.from('users').update({ role: 'artisan' }).eq('id', user.id);
        } else {
            console.log(`[Admin] User account not found yet. Profile will be linked on registration.`);
        }

        // 3. Create/Update artisan profile (Upsert)
        const artisanId = app.shop_slug || app.id;
        const { error: artisanError } = await supabase.from('artisans').upsert([{
            id: artisanId,
            user_id: user?.id || null,
            email: app.email,
            name: app.creator_name,
            location: app.home_region || 'India',
            specialty: app.primary_craft_category || 'Artisan',
            story: app.craft_origin_story,
            img: app.shop_logo_url,
            process_img: app.shop_banner_url, // Use banner as process_img
            tags: [app.primary_craft_category]
        }]);
        if (artisanError) throw new Error(`Failed to create artisan profile: ${artisanError.message}`);

        // 4. Update application status
        const { error: statusError } = await supabase.from('creator_applications')
            .update({ status: 'approved', admin_notes: sanitize(admin_notes) || 'Approved by Admin' })
            .eq('id', id);
        if (statusError) throw new Error(`Failed to update application status: ${statusError.message}`);

        console.log(`[Admin] Successfully approved artisan: ${artisanId}`);
        res.json({ success: true, artisan_id: artisanId, user_linked: !!user });
    } catch (error) {
        console.error(`[Admin] Approval Error:`, error.message);
        res.status(500).json({ error: error.message });
    }
});

// --- PRODUCT GOVERNANCE ROUTES ---

// Get all pending products for admin review
app.get('/api/admin/products/pending', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*, artisans(name, img)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Approve a product
app.post('/api/admin/products/:id/approve', authenticate, authorize(['admin']), async (req, res) => {
    try {
        // 1. Get product to find artisan_id
        const { data: product } = await supabase.from('products').select('artisan_id').eq('id', req.params.id).maybeSingle();
        if (!product) return res.status(404).json({ error: 'Product not found' });

        // 2. Update product status
        const { error: updateError } = await supabase
            .from('products')
            .update({ status: 'active', is_ready: true })
            .eq('id', req.params.id);
        if (updateError) throw updateError;

        // 3. Increment artisan product count
        const { data: artisan } = await supabase.from('artisans').select('product_count').eq('id', product.artisan_id).maybeSingle();
        const newCount = (artisan?.product_count || 0) + 1;
        
        await supabase
            .from('artisans')
            .update({ product_count: newCount })
            .eq('id', product.artisan_id);

        console.log(`[Admin] Approved product: ${req.params.id}. Artisan count: ${newCount}`);
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// Reject a product
app.post('/api/admin/products/:id/reject', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .update({ status: 'rejected', is_ready: false })
            .eq('id', req.params.id);
        if (error) throw error;

        res.json({ success: true, message: 'Product rejected' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});


app.post('/api/admin/applications/:id/reject', authenticate, authorize(['admin']), async (req, res) => {
    const { id } = req.params;
    const { reason, admin_notes } = req.body;
    try {
        const { error } = await supabase.from('creator_applications')
            .update({ status: 'rejected', admin_notes: `${sanitize(reason)}. ${sanitize(admin_notes) || ''}` })
            .eq('id', id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- GLOBAL SEARCH ---

app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json({ products: [], artisans: [] });
    try {
        const [products, artisans] = await Promise.all([
            supabase.from('products').select('*').ilike('name', `%${q}%`).limit(5),
            supabase.from('artisans').select('*').ilike('name', `%${q}%`).limit(3)
        ]);
        res.json({ products: products.data || [], artisans: artisans.data || [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/stats', authenticate, authorize(['admin']), async (req, res) => {
    try {
        // Total GMV (Sum of total_amount for non-cancelled orders)
        const { data: gmvData, error: gmvError } = await supabase
            .from('orders')
            .select('total_amount')
            .not('status', 'eq', 'cancelled');
        if (gmvError) throw gmvError;
        const totalGMV = gmvData.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        // Total Orders
        const totalOrders = gmvData.length;

        // Pending Applications
        const { count: pendingApps, error: appError } = await supabase
            .from('creator_applications')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new');
        if (appError) throw appError;

        // Pending Products
        const { count: pendingProducts, error: prodError } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        if (prodError) throw prodError;

        // Active Artisans
        const { count: activeArtisans, error: artisanError } = await supabase
            .from('artisans')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active');
        if (artisanError) throw artisanError;

        res.json({
            totalGMV,
            totalOrders,
            pendingApps: pendingApps || 0,
            pendingProducts: pendingProducts || 0,
            activeArtisans: activeArtisans || 0,
            commission: totalGMV * 0.05 // 5% commission
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/orders', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*, artisans(brand_name), order_items(*)')
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/orders/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select('*, artisans(*), order_items(*)')
            .eq('id', req.params.id)
            .maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Order not found' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/artisans', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('artisans')
            .select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/artisans/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('artisans')
            .select('*, products(*)')
            .eq('id', req.params.id)
            .maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Artisan not found' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/payouts', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('payouts')
            .select('*, artisans(brand_name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/disputes', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('disputes')
            .select('*, orders(id), artisans(brand_name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/shipping-alerts', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('shipping_alerts')
            .select('*, orders(id), artisans(brand_name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/shipping-alerts/:id/resolve', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const { data, error } = await supabase
            .from('shipping_alerts')
            .update({ 
                status, 
                admin_notes, 
                resolved_at: status === 'resolved' ? new Date() : null 
            })
            .eq('id', req.params.id)
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Global Error Handler (must be at the bottom)
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const startServer = () => {
    try {
        const server = app.listen(PORT, () => {
            console.log(`Backend server running on http://localhost:${PORT}`);
        });

        // Keep-alive interval to prevent event loop from emptying
        setInterval(() => {
            // No-op
        }, 1000 * 60 * 60);

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please kill the other process.`);
                process.exit(1);
            } else {
                console.error('Server error:', err);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
};

startServer();

