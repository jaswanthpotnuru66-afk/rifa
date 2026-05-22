import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
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
    is_combo: z.boolean().optional(),
    combo_items: z.array(z.string()).optional(),
    artisan_id: z.string().optional(),
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
    user_id: z.string().uuid().optional(),
    promoCode: z.string().optional().nullable(),
    promoDiscount: z.number().optional().nullable()
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
        const { limit, category, artisan_id, is_combo } = req.query;
        let query = supabase.from('products').select('*').eq('status', 'active');
        
        if (category) query = query.ilike('category', category);
        if (artisan_id) query = query.eq('artisan_id', artisan_id);
        if (is_combo === 'true') query = query.eq('is_combo', true);
        if (is_combo === 'false') query = query.eq('is_combo', false);
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

app.get('/api/combos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('combos').select('*').order('tier', { ascending: true });
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
        let artisan_id = req.body.artisan_id;
        if (!artisan_id) {
            const { data: prod } = await supabase.from('products').select('artisan_id').eq('id', req.body.product_id).maybeSingle();
            if (prod) {
                artisan_id = prod.artisan_id;
            }
        }
        // Enforce user_id
        const item = { ...req.body, artisan_id, user_id: req.user.id };
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
        
        // Flatten proof details dynamically
        const flattenedData = data.map(order => {
            if (order.shipping_address) {
                const address = typeof order.shipping_address === 'string'
                    ? JSON.parse(order.shipping_address)
                    : order.shipping_address;
                if (address && address.proof_details) {
                    return {
                        ...order,
                        ...address.proof_details
                    };
                }
            }
            return order;
        });
        
        res.json(flattenedData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/orders/:id', authenticate, async (req, res) => {
    try {
        const { status, proofStatus, proofUrl, proofSentAt, buyerResponseAt, buyerRevisionComment, revisionRound, specs, isCustom } = req.body;
        
        // Fetch the current order
        const { data: currentOrder, error: fetchError } = await supabase.from('orders')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();
        
        if (fetchError || !currentOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const shippingAddress = typeof currentOrder.shipping_address === 'string' 
            ? JSON.parse(currentOrder.shipping_address) 
            : (currentOrder.shipping_address || {});
        
        const currentProofDetails = shippingAddress.proof_details || {};
        
        const updatedProofDetails = {
            ...currentProofDetails,
            isCustom: isCustom !== undefined ? isCustom : (currentProofDetails.isCustom !== undefined ? currentProofDetails.isCustom : true)
        };
        
        if (proofStatus !== undefined) updatedProofDetails.proofStatus = proofStatus;
        if (proofUrl !== undefined) updatedProofDetails.proofUrl = proofUrl;
        if (proofSentAt !== undefined) updatedProofDetails.proofSentAt = proofSentAt;
        if (buyerResponseAt !== undefined) updatedProofDetails.buyerResponseAt = buyerResponseAt;
        if (buyerRevisionComment !== undefined) updatedProofDetails.buyerRevisionComment = buyerRevisionComment;
        if (revisionRound !== undefined) updatedProofDetails.revisionRound = revisionRound;
        if (specs !== undefined) updatedProofDetails.specs = specs;

        const updatedAddress = {
            ...shippingAddress,
            proof_details: updatedProofDetails
        };

        const updateData = {
            shipping_address: updatedAddress
        };
        
        if (status !== undefined) updateData.status = status;

        const { data, error: updateError } = await supabase.from('orders')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .maybeSingle();

        if (updateError) throw updateError;
        
        // Return the updated order with flattened proof details
        const flattenedOrder = {
            ...data,
            ...updatedProofDetails
        };
        
        res.json(flattenedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders/:id/dispute', authenticate, async (req, res) => {
    try {
        const { category, description, evidenceUrls } = req.body;
        if (!category) {
            return res.status(400).json({ error: 'Dispute category is required' });
        }

        // Fetch the current order
        const { data: order, error: fetchError } = await supabase.from('orders')
            .select('*, order_items(*)')
            .eq('id', req.params.id)
            .maybeSingle();
        
        if (fetchError || !order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if the order belongs to this user
        if (order.user_id !== req.user.id) {
            return res.status(403).json({ error: 'You are not authorized to dispute this order' });
        }

        // Check if the order is delivered
        if (order.status !== 'delivered') {
            return res.status(400).json({ error: 'Disputes can only be raised for delivered orders' });
        }

        const artisanId = order.order_items?.[0]?.artisan_id || null;
        const urlsArray = Array.isArray(evidenceUrls) 
            ? evidenceUrls 
            : (evidenceUrls ? [evidenceUrls] : []);

        // 1. Update order status to 'disputed'
        const { error: updateError } = await supabase.from('orders')
            .update({ status: 'disputed' })
            .eq('id', order.id);
        
        if (updateError) throw updateError;

        // 2. Insert the dispute row
        const { data: dispute, error: disputeError } = await supabase.from('disputes')
            .insert({
                order_id: order.id,
                artisan_id: artisanId,
                buyer_id: req.user.id,
                category,
                description: description || '',
                evidence_urls: urlsArray,
                status: 'open'
            })
            .select()
            .maybeSingle();

        if (disputeError) throw disputeError;

        res.status(201).json(dispute);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- BUYER: Leave a review after delivery ---
app.post('/api/orders/:id/review', authenticate, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', req.params.id)
            .maybeSingle();

        if (fetchError || !order) return res.status(404).json({ error: 'Order not found' });
        if (order.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        if (order.status !== 'delivered') return res.status(400).json({ error: 'Reviews can only be left for delivered orders' });

        const { data: user } = await supabase.from('users').select('full_name').eq('id', req.user.id).maybeSingle();
        const userName = user?.full_name || 'Verified Buyer';

        // Insert a review for each item in the order
        const reviewPromises = order.order_items.map((item) =>
            supabase.from('product_reviews').insert({
                product_id: item.product_id,
                user_name: userName,
                rating,
                comment: comment || '',
                verified: true
            })
        );
        await Promise.all(reviewPromises);

        res.status(201).json({ success: true, message: 'Review submitted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- BUYER: Cancel an order (only pending/confirmed) ---
app.post('/api/orders/:id/cancel', authenticate, async (req, res) => {
    try {
        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (fetchError || !order) return res.status(404).json({ error: 'Order not found' });
        if (order.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
        
        const cancellableStatuses = ['pending', 'confirmed'];
        if (!cancellableStatuses.includes(order.status)) {
            return res.status(400).json({ error: 'Only pending or confirmed orders can be cancelled' });
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order.id)
            .select()
            .maybeSingle();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/orders', authenticate, validate(OrderSchema), async (req, res) => {
    const { items, address, paymentMethod, totalAmount, isGifting, giftMessage, promoCode, promoDiscount } = req.body;
    console.log('--- NEW ORDER ATTEMPT ---');
    console.log('Items:', items.map(i => ({ name: i.product_name, artisan: i.artisan_id })));
    const user_id = req.user.id;
    let artisan_id = items[0]?.artisan_id; // Store primary artisan for admin dashboard filtering
    const payment_status = paymentMethod === 'cod' ? 'pending' : 'completed';
    try {
        // Fetch all product details to guarantee we have their artisan_id
        const productIds = items.map(i => i.product_id).filter(Boolean);
        let productMap = {};
        if (productIds.length > 0) {
            const { data: dbProducts, error: dbProductsError } = await supabase
                .from('products')
                .select('id, artisan_id')
                .in('id', productIds);
            if (!dbProductsError && dbProducts) {
                dbProducts.forEach(p => {
                    productMap[p.id] = p.artisan_id;
                });
            }
        }

        if (!artisan_id && items[0]) {
            artisan_id = items[0].artisan_id || productMap[items[0].product_id] || null;
        }

        // --- DYNAMIC PROMOTIONS VALIDATION & SETTLEMENT ENGINE ---
        let calculatedDiscount = 0;
        let appliedPromo = null;
        let coupon_details = null;

        if (promoCode) {
            const { data: promo, error: promoErr } = await supabase
                .from('promotions')
                .select('*')
                .eq('is_active', true)
                .eq('code', promoCode.toUpperCase())
                .maybeSingle();

            if (promoErr || !promo) {
                return res.status(400).json({ error: 'Invalid or inactive promotion code.' });
            }

            appliedPromo = promo;

            // Check if coupon is artisan scoped
            if (promo.artisan_id) {
                const artisanItems = items.filter(item => (item.artisan_id || productMap[item.product_id]) === promo.artisan_id);
                if (artisanItems.length === 0) {
                    return res.status(400).json({ error: `This promotion code is only valid for items from this artisan.` });
                }

                const artisanSubtotal = artisanItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                if (promo.type === 'percentage') {
                    calculatedDiscount = artisanSubtotal * (promo.value / 100);
                } else {
                    calculatedDiscount = Math.min(promo.value, artisanSubtotal);
                }
            } else {
                // Admin coupon (global)
                const globalSubtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                if (promo.type === 'percentage') {
                    calculatedDiscount = globalSubtotal * (promo.value / 100);
                } else {
                    calculatedDiscount = Math.min(promo.value, globalSubtotal);
                }
            }

            calculatedDiscount = Math.round(calculatedDiscount * 100) / 100;
            coupon_details = {
                code: promo.code,
                discount: calculatedDiscount,
                sponsor: promo.artisan_id ? 'artisan' : 'admin',
                artisan_id: promo.artisan_id
            };
        }

        // Embed coupon_details into address metadata dynamically
        const enrichedAddress = {
            ...address,
            coupon_details: coupon_details || null
        };

        const { data: order, error: orderError } = await supabase.from('orders').insert([{
            user_id, total_amount: totalAmount, payment_method: paymentMethod, shipping_address: enrichedAddress,
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
            artisan_id: item.artisan_id || productMap[item.product_id] || null
        }));
        
        const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
        if (itemsError) throw itemsError;

        // --- AUTOMATED LEDGER & DISBURSAL SETTLEMENT ENGINE ---
        // Dynamically compute the payout based on discount responsibility
        let commissionRate = 5.0;
        try {
            if (fs.existsSync(settingsPath)) {
                const s = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                commissionRate = Number(s.commissionRate) || 5.0;
            }
        } catch (e) {
            console.error('Error reading settings for payout:', e);
        }

        // Calculate original gross sales from matching items in this order
        const artisanItems = orderItems.filter(item => item.artisan_id === artisan_id);
        const originalGross = artisanItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        let grossAmount = originalGross;
        if (coupon_details) {
            if (coupon_details.sponsor === 'artisan') {
                // Artisan sponsors discount -> subtract it from their payout gross
                grossAmount = Math.max(0, originalGross - coupon_details.discount);
            } else {
                // Admin sponsors discount -> gross payout is untouched!
                grossAmount = originalGross;
            }
        }

        const commissionAmount = grossAmount * (commissionRate / 100);
        const tcsAmount = grossAmount * 0.01;
        const netAmount = grossAmount - commissionAmount - tcsAmount;

        const { error: payoutError } = await supabase.from('payouts').insert([{
            artisan_id,
            order_ids: [order.id],
            gross_amount: Number(grossAmount.toFixed(2)),
            commission_amount: Number(commissionAmount.toFixed(2)),
            tcs_amount: Number(tcsAmount.toFixed(2)),
            net_amount: Number(netAmount.toFixed(2)),
            status: 'pending'
        }]);

        if (payoutError) {
            console.error('Failed to auto-generate payout record:', payoutError.message);
        } else {
            console.log(`Auto-generated dynamic payout for artisan ${artisan_id}: gross = ₹${grossAmount}, net = ₹${netAmount}`);
        }

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

        const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select('price, quantity, orders(status, created_at)')
            .eq('artisan_id', artisan.id);
        if (itemsError) throw itemsError;
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const todayRevenue = (items || []).filter(i => i.orders?.created_at && new Date(i.orders.created_at) >= today).reduce((acc, i) => acc + (Number(i.price) * i.quantity), 0);
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

        const { data: orders, error } = await supabase.from('order_items').select('*, orders(*)').eq('artisan_id', artisan.id);
        if (error) throw error;

        const flattened = (orders || []).map(item => {
            const orderData = item.orders;
            if (orderData && orderData.shipping_address) {
                const address = typeof orderData.shipping_address === 'string'
                    ? JSON.parse(orderData.shipping_address)
                    : orderData.shipping_address;
                orderData.shipping_address = address;
                if (address && address.proof_details) {
                    Object.assign(orderData, address.proof_details);
                }
            }
            return {
                ...item,
                orders: orderData
            };
        });

        // Sort by parent order's created_at descending
        const sorted = flattened.sort((a, b) => {
            const timeA = a.orders?.created_at ? new Date(a.orders.created_at).getTime() : 0;
            const timeB = b.orders?.created_at ? new Date(b.orders.created_at).getTime() : 0;
            return timeB - timeA;
        });

        res.json(sorted);
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

        const orderData = items[0].orders;
        if (orderData && orderData.shipping_address) {
            const address = typeof orderData.shipping_address === 'string'
                ? JSON.parse(orderData.shipping_address)
                : orderData.shipping_address;
            orderData.shipping_address = address;
            if (address && address.proof_details) {
                Object.assign(orderData, address.proof_details);
            }
        }

        res.json({
            items,
            order: orderData
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ARTISAN: Accept a confirmed order ---
app.patch('/api/artisan/orders/:id/accept', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });

        const { data: order, error: fetchErr } = await supabase.from('orders')
            .select('*').eq('id', req.params.id).maybeSingle();
        if (fetchErr || !order) return res.status(404).json({ error: 'Order not found' });
        if (order.artisan_id !== artisan.id) return res.status(403).json({ error: 'Unauthorized' });
        if (order.status !== 'confirmed') return res.status(400).json({ error: 'Only confirmed orders can be accepted' });

        const { data, error } = await supabase.from('orders')
            .update({ status: 'in-production' })
            .eq('id', order.id).select().maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ARTISAN: Reject / Cancel an order ---
app.patch('/api/artisan/orders/:id/reject', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });

        const { reason } = req.body;
        const { data: order, error: fetchErr } = await supabase.from('orders')
            .select('*').eq('id', req.params.id).maybeSingle();
        if (fetchErr || !order) return res.status(404).json({ error: 'Order not found' });
        if (order.artisan_id !== artisan.id) return res.status(403).json({ error: 'Unauthorized' });
        if (!['confirmed', 'in-production'].includes(order.status)) {
            return res.status(400).json({ error: 'Only confirmed or in-production orders can be rejected' });
        }

        const { data, error } = await supabase.from('orders')
            .update({ status: 'cancelled' })
            .eq('id', order.id).select().maybeSingle();
        if (error) throw error;
        res.json({ ...data, reason });
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

        let productData = { 
            ...req.body, 
            id: `${slugify(req.body.name)}-${Math.random().toString(36).substr(2, 5)}`,
            artisan_id: artisan.id,
            status: 'pending' // Enforce pending status for new products
        };

        // --- COMBOS LOGIC: Single-Unit Rule ---
        if (productData.is_combo && productData.combo_items && Array.isArray(productData.combo_items)) {
            // Fetch child products to enforce Custom Trap and Weight Math
            const { data: children, error: childError } = await supabase
                .from('products')
                .select('id, is_custom, details')
                .in('id', productData.combo_items)
                .eq('artisan_id', artisan.id); // Single-origin enforcement

            if (childError) throw childError;
            if (!children || children.length !== productData.combo_items.length) {
                return res.status(400).json({ error: 'One or more items in the combo are invalid or do not belong to you.' });
            }

            // Custom Trap: If ANY child is custom, the combo is custom
            const hasCustom = children.some(child => child.is_custom === true);
            if (hasCustom) {
                productData.is_custom = true;
                productData.is_customizable = true;
            }

            // Weight Math: Sum the weights of all children
            let totalWeight = 0;
            children.forEach(child => {
                const weightStr = (child.details || []).find(d => d.startsWith('Weight:'));
                if (weightStr) {
                    const wMatch = weightStr.match(/(\d+)/);
                    if (wMatch) totalWeight += parseInt(wMatch[1], 10);
                }
            });

            // Ensure details is an object if not already, to inject the summed weight
            if (!productData.details || typeof productData.details !== 'object' || Array.isArray(productData.details)) {
                productData.details = { weight: totalWeight };
            } else {
                productData.details.weight = totalWeight;
            }
        }

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

app.put('/api/artisan/products/:id', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });

        const { name, price, original_price, description, category, images, is_custom, is_customizable, tag, details, is_ready, is_natural } = req.body;

        const updateData = { status: 'pending' }; // Re-submit for admin review on any edit
        if (name !== undefined) updateData.name = sanitize(name);
        if (price !== undefined) updateData.price = Number(price);
        if (original_price !== undefined) updateData.original_price = original_price ? Number(original_price) : null;
        if (description !== undefined) updateData.description = sanitize(description);
        if (category !== undefined) updateData.category = category;
        if (images !== undefined) updateData.images = images;
        if (is_custom !== undefined) updateData.is_custom = is_custom;
        if (is_customizable !== undefined) updateData.is_customizable = is_customizable;
        if (tag !== undefined) updateData.tag = tag;
        if (is_natural !== undefined) updateData.is_natural = is_natural;
        if (details !== undefined) {
            // Convert object details to array format if needed
            if (typeof details === 'object' && !Array.isArray(details)) {
                const detailsArray = [];
                const d = details;
                if (d.stateOfOrigin) detailsArray.push(`Origin: ${d.stateOfOrigin}`);
                if (d.processingTime) detailsArray.push(`Processing Time: ${d.processingTime} days`);
                if (d.weight) detailsArray.push(`Weight: ${d.weight}g`);
                if (d.dimensions?.l) detailsArray.push(`Dimensions: ${d.dimensions.l}x${d.dimensions.w}x${d.dimensions.h} cm`);
                updateData.details = detailsArray;
            } else {
                updateData.details = details;
            }
        }

        const { data, error } = await supabase.from('products').update(updateData).eq('id', req.params.id).eq('artisan_id', artisan.id).select().maybeSingle();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Product not found or unauthorized' });
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
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

// --- ARTISAN DYNAMIC OPERATIONS ---

app.get('/api/artisan/disputes', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { data, error } = await supabase.from('disputes').select('*, orders(*)').eq('artisan_id', artisan.id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/artisan/disputes/:id/respond', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { response } = req.body;
        const { data, error } = await supabase.from('disputes').update({ artisan_response: response, status: 'under-review' }).eq('id', req.params.id).eq('artisan_id', artisan.id).select().maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/payouts', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { data, error } = await supabase.from('payouts').select('*').eq('artisan_id', artisan.id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/earnings/stats', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { data: payouts, error } = await supabase.from('payouts').select('*').eq('artisan_id', artisan.id);
        if (error) throw error;
        
        let grossSales = 0;
        let tcs = 0;
        let commission = 0;
        let netPaid = 0;
        let pending = 0;
        let held = 0;
        
        (payouts || []).forEach(p => {
            const gross = Number(p.gross_amount) || 0;
            const tcs_amt = Number(p.tcs_amount) || 0;
            const comm = Number(p.commission_amount) || 0;
            const net = Number(p.net_amount) || 0;
            
            grossSales += gross;
            tcs += tcs_amt;
            commission += comm;
            
            if (p.status === 'released') {
                netPaid += net;
            } else if (p.status === 'pending') {
                pending += net;
            } else if (p.status === 'held') {
                held += net;
            }
        });
        
        res.json({ grossSales, tcs, commission, netPaid, pending, held });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/shipping-alerts', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { data, error } = await supabase.from('shipping_alerts').select('*, orders(*)').eq('artisan_id', artisan.id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/reviews', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { data: products, error: pError } = await supabase.from('products').select('id, name, images').eq('artisan_id', artisan.id);
        if (pError) throw pError;
        
        const productIds = (products || []).map(p => p.id);
        if (!productIds.length) return res.json([]);
        
        const { data: reviews, error: rError } = await supabase.from('product_reviews').select('*').in('product_id', productIds).order('created_at', { ascending: false });
        if (rError) throw rError;
        
        const enriched = reviews.map(r => {
            const prod = products.find(p => p.id === r.product_id);
            return {
                ...r,
                product_name: prod ? prod.name : 'Unknown Product',
                product_image: prod && prod.images ? prod.images[0] : null
            };
        });
        
        res.json(enriched);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/artisan/reviews/:id/reply', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { reply } = req.body;
        const { data, error } = await supabase.from('product_reviews').update({ maker_reply: reply }).eq('id', req.params.id).select().maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/promotions', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { data, error } = await supabase.from('promotions').select('*').eq('artisan_id', artisan.id).order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/artisan/promotions', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { title, description, code, type, value, start_date, end_date } = req.body;
        const promoData = {
            title,
            description,
            code,
            type,
            value: Number(value),
            start_date: start_date || new Date().toISOString(),
            end_date: end_date || new Date(Date.now() + 30*24*60*60*1000).toISOString(),
            artisan_id: artisan.id,
            is_active: true
        };
        
        const { data, error } = await supabase.from('promotions').insert([promoData]).select().maybeSingle();
        if (error) throw error;
        res.status(201).json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/artisan/promotions/:id', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { error } = await supabase.from('promotions').delete().eq('id', req.params.id).eq('artisan_id', artisan.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/analytics', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { data: products, error: pError } = await supabase.from('products').select('*').eq('artisan_id', artisan.id);
        if (pError) throw pError;
        
        const viewsCount = products.reduce((acc, p) => acc + (p.review_count || 0) * 12 + 100, 0);
        const salesVolume = products.reduce((acc, p) => acc + (p.review_count || 0), 0);
        const conversionRate = salesVolume > 0 ? ((salesVolume / viewsCount) * 100).toFixed(1) + '%' : '0.0%';
        const avgOrderValue = products.length > 0 ? Math.round(products.reduce((acc, p) => acc + p.price, 0) / products.length) : 0;
        
        const kpis = {
            totalViews: viewsCount,
            totalClicks: Math.round(viewsCount * 0.42),
            conversionRate,
            avgOrderValue,
            repeatBuyerRate: products.length > 0 ? '14%' : '0%'
        };

        // Fetch payouts to calculate daily revenue
        const { data: payouts } = await supabase.from('payouts').select('*').eq('artisan_id', artisan.id);
        
        const dailyRevenueMap = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            dailyRevenueMap[dateStr] = 0;
        }

        (payouts || []).forEach(p => {
            const dateStr = new Date(p.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
            if (dailyRevenueMap[dateStr] !== undefined) {
                dailyRevenueMap[dateStr] += Number(p.gross_amount) || 0;
            }
        });

        const dailyRevenue = Object.entries(dailyRevenueMap).map(([date, amount]) => ({ date, amount }));

        // Category breakdown
        const categories = {};
        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            categories[cat] = (categories[cat] || 0) + (p.review_count || 0) + 1;
        });
        const categoryBreakdown = Object.entries(categories).map(([category, count]) => ({ category, count }));

        // Top Performing Products
        const enrichedProducts = products.map(p => ({
            id: p.id,
            name: p.name,
            views: (p.review_count || 0) * 12 + 10,
            orders: p.review_count || 0,
            revenue: (p.review_count || 0) * p.price,
            rating: p.rating || 5.0
        }));
        const topProducts = enrichedProducts.sort((a, b) => b.revenue - a.revenue).slice(0, 4);

        // Review distribution
        const reviewDistribution = {
            5: products.filter(p => (p.rating || 0) >= 4.5 || !(p.rating)).length,
            4: products.filter(p => (p.rating || 0) >= 3.5 && (p.rating || 0) < 4.5).length,
            3: products.filter(p => (p.rating || 0) >= 2.5 && (p.rating || 0) < 3.5).length,
            2: products.filter(p => (p.rating || 0) >= 1.5 && (p.rating || 0) < 2.5).length,
            1: products.filter(p => (p.rating || 0) < 1.5).length
        };

        res.json({ kpis, dailyRevenue, categoryBreakdown, topProducts, reviewDistribution });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/artisan/tax-reports', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id, email').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { data: payouts, error } = await supabase.from('payouts').select('*').eq('artisan_id', artisan.id);
        if (error) throw error;
        
        const monthlyData = {};
        (payouts || []).forEach(p => {
            const date = new Date(p.created_at);
            const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            if (!monthlyData[month]) {
                monthlyData[month] = { month, grossSales: 0, tcs: 0, netPayout: 0 };
            }
            monthlyData[month].grossSales += Number(p.gross_amount) || 0;
            monthlyData[month].tcs += Number(p.tcs_amount) || 0;
            monthlyData[month].netPayout += Number(p.net_amount) || 0;
        });
        
        // Fetch GSTIN from creator_applications using the email
        const { data: appRecord } = await supabase.from('creator_applications').select('gstin').eq('email', artisan.email).maybeSingle();
        
        res.json({
            gstin: appRecord?.gstin || null,
            reports: Object.values(monthlyData)
        });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/artisan/tax-reports/gstin', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('email').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });
        
        const { gstin } = req.body;
        const { error } = await supabase.from('creator_applications').update({ gstin }).eq('email', artisan.email);
        if (error) throw error;
        
        res.json({ success: true, gstin });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ADMIN SETTINGS, FLAGGED LISTINGS, TAX ENDPOINTS ---

const settingsPath = path.join(process.cwd(), 'platform_settings.json');
const getDefaultSettings = () => ({
    commissionRate: 5.0,
    listingFee: 0,
    proofResponseDeadlineHours: 24,
    maxProofRevisionRounds: 3,
    maxDispatchWindowDays: 10,
    shippingWeightBufferPercent: 10,
    activeCouriers: ['Delhivery', 'Blue Dart', 'DHL Express']
});

app.get('/api/admin/settings', authenticate, authorize(['admin']), async (req, res) => {
    try {
        if (!fs.existsSync(settingsPath)) {
            fs.writeFileSync(settingsPath, JSON.stringify(getDefaultSettings(), null, 2));
        }
        const data = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/settings', authenticate, authorize(['admin']), async (req, res) => {
    try {
        fs.writeFileSync(settingsPath, JSON.stringify(req.body, null, 2));
        res.json(req.body);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/flagged-listings', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase.from('flagged_listings').select('*, products(name, images), artisans(name)').order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/admin/flagged-listings/:id/resolve', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await supabase.from('flagged_listings').update({ status }).eq('id', req.params.id).select().maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/admin/tax-reports', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data: payouts, error } = await supabase.from('payouts').select('*, artisans(name)');
        if (error) throw error;
        
        const monthlyData = {};
        (payouts || []).forEach(p => {
            const date = new Date(p.created_at);
            const month = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            
            if (!monthlyData[month]) {
                monthlyData[month] = { 
                    month, 
                    grossSales: 0, 
                    tcsCollected: 0, 
                    commissions: 0,
                    artisans: new Set()
                };
            }
            monthlyData[month].grossSales += Number(p.gross_amount) || 0;
            monthlyData[month].tcsCollected += Number(p.tcs_amount) || 0;
            monthlyData[month].commissions += Number(p.commission_amount) || 0;
            if (p.artisan_id) {
                monthlyData[month].artisans.add(p.artisan_id);
            }
        });
        
        const result = Object.values(monthlyData).map(m => {
            const makerCount = m.artisans.size || 1;
            return {
                month: m.month,
                totalGrossSales: m.grossSales,
                totalTCSCollected: m.tcsCollected,
                makerCount,
                averagePerMaker: Math.round(m.grossSales / makerCount),
                exportedAt: new Date().toISOString()
            };
        });
        
        res.json(result);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- BUYER DYNAMIC OFFERS & PROMOTIONS ENDPOINTS ---

app.get('/api/combos', async (req, res) => {
    try {
        const { data, error } = await supabase.from('offers_combos').select('*').order('created_at', { ascending: true });
        if (error) throw error;
        res.json(data || []);
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/promotions', async (req, res) => {
    try {
        const { data, error } = await supabase.from('promotions').select('*, artisans(name)').eq('is_active', true);
        if (error) throw error;
        res.json(data || []);
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
            whatsapp_number: app.whatsapp_number,
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

// Admin delete/unpublish product
app.delete('/api/admin/products/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', req.params.id);
            
        if (error) throw error;
        res.json({ message: 'Product deleted successfully' });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

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
    
    const searchStr = q.trim();
    try {
        const [products, artisans] = await Promise.all([
            supabase.from('products')
                .select('*, artisans(*)')
                .or(`name.ilike.%${searchStr}%,category.ilike.%${searchStr}%,description.ilike.%${searchStr}%,tag.ilike.%${searchStr}%`)
                .limit(20),
            supabase.from('artisans')
                .select('*')
                .or(`name.ilike.%${searchStr}%,specialty.ilike.%${searchStr}%,story.ilike.%${searchStr}%`)
                .limit(10)
        ]);
        
        res.json({ 
            products: products.data || [], 
            artisans: artisans.data || [] 
        });
    } catch (error) {
        console.error('Search API Error:', error);
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
            .select('*', { count: 'exact', head: true });
        if (artisanError) throw artisanError;

        // Load dynamic commission rate from settings
        let commissionRate = 0.05; // Fallback to 5%
        try {
            if (fs.existsSync(settingsPath)) {
                const settingsData = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
                if (settingsData && typeof settingsData.commissionRate === 'number') {
                    commissionRate = settingsData.commissionRate / 100;
                }
            }
        } catch (e) {
            console.error('Failed to load dynamic commission rate:', e);
        }

        res.json({
            totalGMV,
            totalOrders,
            pendingApps: pendingApps || 0,
            pendingProducts: pendingProducts || 0,
            activeArtisans: activeArtisans || 0,
            commission: totalGMV * commissionRate,
            commissionRate: commissionRate * 100
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/orders', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) throw error;

        if (!orders || orders.length === 0) {
            return res.json([]);
        }

        const artisanIds = new Set();
        orders.forEach(o => {
            if (o.artisan_id) artisanIds.add(o.artisan_id);
            o.order_items?.forEach(item => {
                if (item.artisan_id) artisanIds.add(item.artisan_id);
            });
        });

        const artisansMap = {};
        if (artisanIds.size > 0) {
            const { data: artisans, error: artError } = await supabase
                .from('artisans')
                .select('id, name, specialty, location, img, product_count')
                .in('id', Array.from(artisanIds));
            if (artError) throw artError;
            
            artisans?.forEach(a => {
                artisansMap[a.id] = {
                    ...a,
                    brand_name: a.name
                };
            });
        }

        const formatted = orders.map(o => {
            const artId = o.artisan_id || o.order_items?.[0]?.artisan_id;
            let address = o.shipping_address;
            if (address && typeof address === 'string') {
                try { address = JSON.parse(address); } catch (e) {}
            }
            return {
                ...o,
                shipping_address: address,
                artisans: artisansMap[artId] || null
            };
        });

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/orders/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data: order, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', req.params.id)
            .maybeSingle();
        if (error) throw error;
        if (!order) return res.status(404).json({ error: 'Order not found' });

        let artisan = null;
        const artisanId = order.artisan_id || order.order_items?.[0]?.artisan_id;
        if (artisanId) {
            const { data: artData, error: artError } = await supabase
                .from('artisans')
                .select('*')
                .eq('id', artisanId)
                .maybeSingle();
            if (artError) throw artError;
            if (artData) {
                artisan = {
                    ...artData,
                    brand_name: artData.name
                };
            }
        }

        let address = order.shipping_address;
        if (address && typeof address === 'string') {
            try { address = JSON.parse(address); } catch (e) {}
        }

        res.json({
            ...order,
            shipping_address: address,
            artisans: artisan
        });
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
        const { data: payouts, error } = await supabase
            .from('payouts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        if (!payouts || payouts.length === 0) {
            return res.json([]);
        }

        const artisanIds = Array.from(new Set(payouts.map(p => p.artisan_id).filter(Boolean)));
        const artisansMap = {};
        if (artisanIds.length > 0) {
            const { data: artisans, error: artError } = await supabase
                .from('artisans')
                .select('id, name')
                .in('id', artisanIds);
            if (artError) throw artError;
            artisans?.forEach(a => {
                artisansMap[a.id] = { brand_name: a.name };
            });
        }

        const formatted = payouts.map(p => ({
            ...p,
            artisans: artisansMap[p.artisan_id] || null
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/disputes', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data: disputes, error } = await supabase
            .from('disputes')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        if (!disputes || disputes.length === 0) {
            return res.json([]);
        }

        const artisanIds = Array.from(new Set(disputes.map(d => d.artisan_id).filter(Boolean)));
        const orderIds = Array.from(new Set(disputes.map(d => d.order_id).filter(Boolean)));
        const buyerIds = Array.from(new Set(disputes.map(d => d.buyer_id).filter(Boolean)));

        const artisansMap = {};
        if (artisanIds.length > 0) {
            const { data: artisans, error: artError } = await supabase
                .from('artisans')
                .select('id, name')
                .in('id', artisanIds);
            if (artError) throw artError;
            artisans?.forEach(a => {
                artisansMap[a.id] = { brand_name: a.name };
            });
        }

        const ordersMap = {};
        if (orderIds.length > 0) {
            const { data: orders, error: ordError } = await supabase
                .from('orders')
                .select('id')
                .in('id', orderIds);
            if (ordError) throw ordError;
            orders?.forEach(o => {
                ordersMap[o.id] = { id: o.id };
            });
        }

        const buyersMap = {};
        if (buyerIds.length > 0) {
            const { data: buyerUsers, error: buyerError } = await supabase
                .from('users')
                .select('id, full_name, email')
                .in('id', buyerIds);
            if (buyerError) throw buyerError;
            buyerUsers?.forEach(u => {
                buyersMap[u.id] = { full_name: u.full_name, email: u.email };
            });
        }

        const formatted = disputes.map(d => ({
            ...d,
            artisans: artisansMap[d.artisan_id] || null,
            orders: ordersMap[d.order_id] || null,
            buyer: buyersMap[d.buyer_id] || null
        }));

        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADMIN: Get single dispute detail ---
app.get('/api/admin/disputes/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data: dispute, error } = await supabase
            .from('disputes')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();
        if (error || !dispute) return res.status(404).json({ error: 'Dispute not found' });

        const [artisanRes, orderRes, buyerRes] = await Promise.all([
            dispute.artisan_id ? supabase.from('artisans').select('id, name').eq('id', dispute.artisan_id).maybeSingle() : Promise.resolve({ data: null }),
            dispute.order_id ? supabase.from('orders').select('*, order_items(*)').eq('id', dispute.order_id).maybeSingle() : Promise.resolve({ data: null }),
            dispute.buyer_id ? supabase.from('users').select('id, full_name, email').eq('id', dispute.buyer_id).maybeSingle() : Promise.resolve({ data: null })
        ]);

        res.json({
            ...dispute,
            artisans: artisanRes.data ? { brand_name: artisanRes.data.name } : null,
            orders: orderRes.data || null,
            buyer: buyerRes.data || null
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADMIN: Rule on a dispute ---
app.post('/api/admin/disputes/:id/rule', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { verdict, admin_notes } = req.body;
        if (!verdict) return res.status(400).json({ error: 'Verdict is required' });

        const { data, error } = await supabase
            .from('disputes')
            .update({ status: 'resolved', verdict, admin_notes: admin_notes || '' })
            .eq('id', req.params.id)
            .select()
            .maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADMIN: Update dispute status (e.g., mark as under-review) ---
app.patch('/api/admin/disputes/:id/status', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        const allowedStatuses = ['open', 'under-review'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ error: `Status must be one of: ${allowedStatuses.join(', ')}` });
        }

        const updateData = { status };
        if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

        const { data, error } = await supabase
            .from('disputes')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/shipping-alerts', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data: alerts, error } = await supabase
            .from('shipping_alerts')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;

        if (!alerts || alerts.length === 0) {
            return res.json([]);
        }

        const artisanIds = Array.from(new Set(alerts.map(a => a.artisan_id).filter(Boolean)));
        const orderIds = Array.from(new Set(alerts.map(a => a.order_id).filter(Boolean)));

        const artisansMap = {};
        if (artisanIds.length > 0) {
            const { data: artisans, error: artError } = await supabase
                .from('artisans')
                .select('id, name')
                .in('id', artisanIds);
            if (artError) throw artError;
            artisans?.forEach(a => {
                artisansMap[a.id] = { brand_name: a.name };
            });
        }

        const ordersMap = {};
        if (orderIds.length > 0) {
            const { data: orders, error: ordError } = await supabase
                .from('orders')
                .select('id')
                .in('id', orderIds);
            if (ordError) throw ordError;
            orders?.forEach(o => {
                ordersMap[o.id] = { id: o.id };
            });
        }

        const formatted = alerts.map(a => ({
            ...a,
            artisans: artisansMap[a.artisan_id] || null,
            orders: ordersMap[a.order_id] || null
        }));

        res.json(formatted);
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

// --- ADMIN PAYOUT MANAGEMENT ---

app.patch('/api/admin/payouts/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { status, admin_notes } = req.body;
        if (!['pending', 'released', 'held'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be pending, released, or held.' });
        }

        const updateData = { status, admin_notes: admin_notes || null };
        if (status === 'released') {
            updateData.released_at = new Date().toISOString();
        } else {
            updateData.released_at = null;
        }

        const { data, error } = await supabase
            .from('payouts')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        console.log(`[Admin] Payout ${req.params.id} status updated to: ${status}`);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ADMIN PROMOTIONS MANAGEMENT ---

app.get('/api/admin/promotions', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('promotions')
            .select('*, artisans(name)')
            .order('created_at', { ascending: false });
        if (error) throw error;
        res.json(data || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/promotions', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { title, description, code, type, value, start_date, end_date } = req.body;
        if (!code || !type || !value) {
            return res.status(400).json({ error: 'Code, type, and value are required.' });
        }

        const promoData = {
            title: sanitize(title || `Admin ${type} Promotion`),
            description: sanitize(description || `${type === 'percentage' ? `${value}% off` : `₹${value} off`} — Admin Global`),
            code: code.toUpperCase().replace(/\s+/g, ''),
            type,
            value: Number(value),
            artisan_id: null, // Admin promotions are GLOBAL (null artisan)
            start_date: start_date || new Date().toISOString(),
            end_date: end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true
        };

        const { data, error } = await supabase.from('promotions').insert([promoData]).select().maybeSingle();
        if (error) throw error;
        console.log(`[Admin] Created global promotion: ${promoData.code}`);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.patch('/api/admin/promotions/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { is_active } = req.body;
        const { data, error } = await supabase
            .from('promotions')
            .update({ is_active })
            .eq('id', req.params.id)
            .select()
            .maybeSingle();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/admin/promotions/:id', authenticate, authorize(['admin']), async (req, res) => {
    try {
        const { error } = await supabase.from('promotions').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ message: 'Promotion deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/combos', authenticate, authorize(['admin']), validate(ProductSchema), async (req, res) => {
    try {
        const { artisan_id, is_combo, combo_items, name } = req.body;
        if (!artisan_id || !is_combo || !combo_items || !Array.isArray(combo_items)) {
            return res.status(400).json({ error: 'artisan_id, is_combo, and an array of combo_items are required.' });
        }

        let productData = { 
            ...req.body, 
            id: `${slugify(name || 'combo')}-${Math.random().toString(36).substr(2, 5)}`,
            status: 'active', // Admin creations go live immediately
            is_ready: true
        };

        // --- COMBOS LOGIC: Single-Unit Rule ---
        const { data: children, error: childError } = await supabase
            .from('products')
            .select('id, is_custom, details')
            .in('id', combo_items)
            .eq('artisan_id', artisan_id); // Single-origin enforcement

        if (childError) throw childError;
        if (!children || children.length !== combo_items.length) {
            return res.status(400).json({ error: 'One or more items are invalid or do not belong to the selected Maker.' });
        }

        const hasCustom = children.some(child => child.is_custom === true);
        if (hasCustom) {
            productData.is_custom = true;
            productData.is_customizable = true;
        }

        let totalWeight = 0;
        children.forEach(child => {
            const weightStr = (child.details || []).find(d => d.startsWith('Weight:'));
            if (weightStr) {
                const wMatch = weightStr.match(/(\d+)/);
                if (wMatch) totalWeight += parseInt(wMatch[1], 10);
            }
        });

        if (!productData.details || typeof productData.details !== 'object' || Array.isArray(productData.details)) {
            productData.details = { weight: totalWeight };
        } else {
            productData.details.weight = totalWeight;
        }

        // Convert object details to string array format expected by DB
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

        const { data, error } = await supabase.from('products').insert([productData]).select().maybeSingle();
        if (error) throw error;
        console.log(`[Admin] Created virtual product combo: ${productData.name}`);
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PRODUCT EDIT ROUTE (Artisan) ---

app.put('/api/artisan/products/:id', authenticate, authorize(['artisan']), async (req, res) => {
    try {
        const { data: artisan } = await supabase.from('artisans').select('id').eq('user_id', req.user.id).maybeSingle();
        if (!artisan) return res.status(404).json({ error: 'Artisan not found' });

        // Security: ensure product belongs to this artisan
        const { data: existing } = await supabase.from('products').select('id, artisan_id').eq('id', req.params.id).maybeSingle();
        if (!existing || existing.artisan_id !== artisan.id) {
            return res.status(403).json({ error: 'Forbidden: Product does not belong to this artisan.' });
        }

        const allowedFields = ['name', 'price', 'original_price', 'description', 'category', 'tag', 'images', 'details', 'is_customizable', 'is_natural'];
        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        if (updateData.name) updateData.name = sanitize(updateData.name);
        if (updateData.description) updateData.description = sanitize(updateData.description);

        // Handle details object → array conversion
        if (updateData.details && typeof updateData.details === 'object' && !Array.isArray(updateData.details)) {
            const detailsArray = [];
            const d = updateData.details;
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
            updateData.details = detailsArray;
        }

        // Reset to pending on edit for re-review
        updateData.status = 'pending';

        const { data, error } = await supabase.from('products').update(updateData).eq('id', req.params.id).select().maybeSingle();
        if (error) throw error;
        console.log(`[Artisan] Updated product: ${req.params.id}. Status reset to pending for review.`);
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- CART ITEM QUANTITY UPDATE ---

app.patch('/api/cart/:id', authenticate, async (req, res) => {
    try {
        const { quantity } = req.body;
        if (!quantity || quantity < 1 || quantity > 50) {
            return res.status(400).json({ error: 'Quantity must be between 1 and 50.' });
        }

        const { data, error } = await supabase
            .from('cart')
            .update({ quantity: Number(quantity) })
            .eq('id', req.params.id)
            .eq('user_id', req.user.id) // Security: user can only edit their own cart
            .select()
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Cart item not found.' });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- DEDICATED ADMIN LOGIN ALIAS ---

app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data: admin } = await supabase.from('admins').select('*').eq('email', email).maybeSingle();

        if (!admin) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        const isHashed = admin.password.startsWith('$2');
        const isValid = isHashed ? await bcrypt.compare(password, admin.password) : password === admin.password;

        if (!isValid) {
            return res.status(401).json({ error: 'Invalid admin credentials.' });
        }

        const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, ACTUAL_JWT_SECRET, { expiresIn: '8h' });
        res.json({ token, admin: { id: admin.id, email: admin.email, role: 'admin' }, type: 'admin' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


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

