const API_URL = 'http://localhost:3000/api';

export const api = {
    async register(data: any) {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch (e) {
                return { error: 'Server returned invalid response. Please ensure backend is running.' };
            }
        } catch (e) {
            return { error: 'Could not connect to backend server.' };
        }
    },

    async login(data: any) {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const text = await res.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                return { error: 'Server returned invalid response. Please ensure backend is running.' };
            }
            if (result.token) {
                const storageKey = result.type === 'admin' ? 'rifa_admin_token' : 'rifa_token';
                const userKey = result.type === 'admin' ? 'rifa_admin' : 'rifa_user';
                localStorage.setItem(storageKey, result.token);
                localStorage.setItem(userKey, JSON.stringify(result.user));
            }
            return result;
        } catch (e) {
            return { error: 'Could not connect to backend server.' };
        }
    },

    async adminLogin(data: any) {
        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const text = await res.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                return { error: 'Server returned invalid response. Please ensure backend is running.' };
            }
            if (result.token) {
                localStorage.setItem('rifa_admin_token', result.token);
                localStorage.setItem('rifa_admin', JSON.stringify(result.admin));
            }
            return result;
        } catch (e) {
            return { error: 'Could not connect to backend server.' };
        }
    },

    async getMe() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return null;
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
            this.logout();
            return null;
        }
        return res.json();
    },

    async updateProfile(data: any) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/auth/me`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async getOrders() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return [];
        const res = await fetch(`${API_URL}/user/orders`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async getAddresses() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return [];
        const res = await fetch(`${API_URL}/user/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async getWishlist() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return [];
        const res = await fetch(`${API_URL}/user/wishlist`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async addAddress(data: any) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/user/addresses`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async deleteAddress(id: string) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/user/addresses/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
    },

    async getCart() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return [];
        const res = await fetch(`${API_URL}/user/cart`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async deleteAccount() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/auth/me`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
            this.logout();
        }
        return res.json();
    },

    logout() {
        localStorage.removeItem('rifa_token');
        localStorage.removeItem('rifa_user');
        localStorage.removeItem('rifa_admin_token');
        localStorage.removeItem('rifa_admin');
    },

    getUser() {
        const user = localStorage.getItem('rifa_user');
        return user ? JSON.parse(user) : null;
    },

    getAdmin() {
        const admin = localStorage.getItem('rifa_admin');
        return admin ? JSON.parse(admin) : null;
    }
};
