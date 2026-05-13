import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'rifa_secret_key_123';

// Initialize Supabase Client (Admin mode if service key is provided)
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

// --- Auth Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
    const { email, password, fullName, phone, location } = req.body;

    try {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert into custom users table
        const { data, error } = await supabase
            .from('users')
            .insert([
                { 
                    email, 
                    password_hash: passwordHash, 
                    full_name: fullName, 
                    mobile_number: phone, 
                    location 
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Create JWT
        const token = jwt.sign({ id: data.id, email: data.email }, JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({ user: data, token });
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(400).json({ error: error.message });
    }
});

// Unified Login (Buyer, Craftmaker, Admin)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check Standard Users table (Buyers & Craftmakers)
        let { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (user) {
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
                return res.json({ user, token, type: user.role });
            }
        }

        // 2. Check Admins table
        let { data: admin, error: adminError } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (admin) {
            // Support both hashed and plain text for admin
            let isAdminMatch = false;
            if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
                isAdminMatch = await bcrypt.compare(password, admin.password);
            } else {
                isAdminMatch = (password === admin.password);
            }

            if (isAdminMatch) {
                const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
                return res.json({ user: admin, token, type: 'admin' });
            }
        }

        return res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
        console.error('Unified Login Error:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Current User (Profile)
app.get('/api/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.id)
            .single();

        if (error || !user) throw new Error('User not found');

        res.json(user);
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// Delete Account (Deactivate)
app.delete('/api/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', decoded.id);

        if (error) throw error;

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Profile
app.post('/api/auth/me', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { full_name, phone, location } = req.body;

        const { data, error } = await supabase
            .from('users')
            .update({ full_name, phone, location })
            .eq('id', decoded.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- User Data Routes ---

// Get Orders
app.get('/api/user/orders', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('user_id', decoded.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Addresses
app.get('/api/user/addresses', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data, error } = await supabase
            .from('users')
            .select('saved_addresses')
            .eq('id', decoded.id)
            .maybeSingle();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'User record not found in artisan vault. Please logout and login again.' });
        res.json(data.saved_addresses || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Wishlist
app.get('/api/user/wishlist', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data, error } = await supabase
            .from('wishlist')
            .select('*')
            .eq('user_id', decoded.id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add Address
app.post('/api/user/addresses', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 1. Get existing addresses
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('saved_addresses')
            .eq('id', decoded.id)
            .maybeSingle();
        
        if (fetchError) throw fetchError;
        if (!user) return res.status(404).json({ error: 'User not found. Please logout and login again.' });

        const currentAddresses = user.saved_addresses || [];
        const newAddress = { 
            ...req.body, 
            id: Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString() 
        };

        // If this is the first address or set to default, handle logic
        if (currentAddresses.length === 0) newAddress.is_default = true;
        if (newAddress.is_default) {
            currentAddresses.forEach(a => {
                if (typeof a === 'object') a.is_default = false;
            });
        }

        const updatedAddresses = [...currentAddresses, newAddress];

        // 2. Update users table
        const { error } = await supabase
            .from('users')
            .update({ saved_addresses: updatedAddresses })
            .eq('id', decoded.id);

        if (error) throw error;
        res.json(newAddress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Address
app.delete('/api/user/addresses/:id', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('saved_addresses')
            .eq('id', decoded.id)
            .single();
        
        if (fetchError) throw fetchError;

        const updatedAddresses = (user.saved_addresses || []).filter(a => a.id !== req.params.id);

        const { error } = await supabase
            .from('users')
            .update({ saved_addresses: updatedAddresses })
            .eq('id', decoded.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Cart (Bag)
app.get('/api/user/cart', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const { data, error } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', decoded.id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
