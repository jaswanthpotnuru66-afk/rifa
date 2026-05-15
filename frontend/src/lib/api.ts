const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
                console.error('API Parse Error:', e);
                console.error('Raw response:', text);
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

    async getProduct(id: string) {
        const res = await fetch(`${API_URL}/products/${id}`);
        return res.ok ? res.json() : null;
    },

    async getAddresses(userId?: string) {
        const token = localStorage.getItem('rifa_token');
        const id = userId || this.getUser()?.id;
        const url = id ? `${API_URL}/addresses?user_id=${id}` : `${API_URL}/addresses`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async saveAddress(data: any) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/addresses`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async createOrder(data: any) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/orders`, {
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
        const user = this.getUser();
        if (!token || !user) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/addresses/${id}?user_id=${user.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok;
    },

    async getWishlist() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return [];
        const res = await fetch(`${API_URL}/user/wishlist`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async addToWishlist(data: any) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/user/wishlist`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async removeFromWishlist(id: string) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/user/wishlist/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok;
    },

    async getCart() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return [];
        const res = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async addToCart(data: any) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        return res.json();
    },

    async removeFromCart(id: string) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/cart/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok;
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
    },

    // --- ARTISAN METHODS ---
    async getArtisanStats() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return null;
        const res = await fetch(`${API_URL}/artisan/dashboard-stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : null;
    },

    async updateArtisanProfile(data: any) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/profile`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown server error' }));
            return { error: errorData.error || errorData.details || errorData.message || res.statusText };
        }
        return res.json();
    },

    async getArtisanOrders() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return [];
        const res = await fetch(`${API_URL}/artisan/orders`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async getArtisanOrderDetail(id: string) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/orders/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : null;
    },

    async getArtisanProducts() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return [];
        const res = await fetch(`${API_URL}/artisan/products`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok ? res.json() : [];
    },

    async createProduct(data: any) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/products`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown server error' }));
            return { error: errorData.error || errorData.details || errorData.message || res.statusText };
        }
        return res.json();

    },

    async deleteProduct(id: string) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok;
    },

    // --- ADMIN OPS METHODS ---
    async getAdminApplications() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/applications`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async approveApplication(id: string, notes: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/applications/${id}/approve`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ admin_notes: notes }),
        });
        const data = await res.json();
        return res.ok ? data : { success: false, error: data.error || 'Failed to approve application' };
    },

    async rejectApplication(id: string, reason: string, notes: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/applications/${id}/reject`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ reason, admin_notes: notes }),
        });
        return res.ok ? res.json() : null;
    },

    async forgotPassword(email: string) {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        return res.json();
    },

    async resetPasswordDirect(email: string, newPassword: string) {
        const res = await fetch(`${API_URL}/auth/reset-password-direct`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, newPassword })
        });
        return res.json();
    },

    // --- PRODUCT GOVERNANCE ---
    async getPendingProducts() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/products/pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async approveProduct(id: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/products/${id}/approve`, { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },

    async rejectProduct(id: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/products/${id}/reject`, { 
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.json();
    },
    
    async getAdminOrders() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async getAdminOrder(id: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/orders/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : null;
    },

    async getAdminArtisans() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/artisans`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async getAdminArtisan(id: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/artisans/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : null;
    },

    async getAdminStats() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : null;
    },

    async getAdminPayouts() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/payouts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async getAdminDisputes() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/disputes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async getAdminShippingAlerts() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/shipping-alerts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async resolveShippingAlert(id: string, status: string, admin_notes: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/shipping-alerts/${id}/resolve`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, admin_notes })
        });
        return res.ok;
    }
};

