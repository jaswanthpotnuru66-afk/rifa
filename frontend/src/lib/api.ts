const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
let artisanStatsCache: any = null;

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

    async updateOrder(id: string, data: any) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/orders/${id}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });
        return res.ok ? res.json() : null;
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

    async getProducts(params?: { is_combo?: boolean; artisan_id?: string }) {
        let url = `${API_URL}/products`;
        if (params) {
            const query = new URLSearchParams();
            if (params.is_combo) query.append('is_combo', 'true');
            if (params.artisan_id) query.append('artisan_id', params.artisan_id);
            url += `?${query.toString()}`;
        }
        const res = await fetch(url);
        return res.ok ? res.json() : [];
    },

    async deleteAdminProduct(id: string) {
        const token = localStorage.getItem('rifa_admin_token');
        if (!token) return false;
        const res = await fetch(`${API_URL}/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.ok;
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

    async raiseDispute(orderId: string, payload: { category: string; description: string; evidenceUrls?: string[] }) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/orders/${orderId}/dispute`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(payload),
        });
        return res.json();
    },

    async submitReview(orderId: string, payload: { rating: number; comment: string }) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/orders/${orderId}/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        return res.json();
    },

    async cancelOrder(orderId: string) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
    },

    async acceptArtisanOrder(orderId: string) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/artisan/orders/${orderId}/accept`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
    },

    async rejectArtisanOrder(orderId: string, reason?: string) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/artisan/orders/${orderId}/reject`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ reason }),
        });
        return res.json();
    },

    async getAdminDisputeDetail(disputeId: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/disputes/${disputeId}`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        return res.json();
    },

    async ruleOnDispute(disputeId: string, payload: { verdict: string; admin_notes?: string }) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/disputes/${disputeId}/rule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        return res.json();
    },

    async updateArtisanProduct(productId: string, payload: any) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/artisan/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload),
        });
        return res.json();
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
    getArtisanStatsCache() {
        return artisanStatsCache;
    },

    async getArtisanStats(forceRefresh = false) {
        if (!forceRefresh && artisanStatsCache) {
            return artisanStatsCache;
        }
        const token = localStorage.getItem('rifa_token');
        if (!token) return null;
        const res = await fetch(`${API_URL}/artisan/dashboard-stats`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });
        if (res.ok) {
            artisanStatsCache = await res.json();
            return artisanStatsCache;
        }
        return null;
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
    },

    async getArtisanDisputes() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/disputes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async respondToDispute(id: string, response: string) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/disputes/${id}/respond`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ response })
        });
        return res.ok ? res.json() : null;
    },

    async getArtisanPayouts() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/payouts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async getArtisanEarningsStats() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/earnings/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : null;
    },

    async getArtisanShippingAlerts() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/shipping-alerts`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async getArtisanReviews() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/reviews`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async replyToReview(id: string, reply: string) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/reviews/${id}/reply`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reply })
        });
        return res.ok ? res.json() : null;
    },

    async getArtisanPromotions() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/promotions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async createPromotion(data: any) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/promotions`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return res.ok ? res.json() : null;
    },

    async deletePromotion(id: string) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/promotions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok;
    },

    async getArtisanAnalytics() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : null;
    },

    async getArtisanTaxReports() {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/tax-reports`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : { gstin: null, reports: [] };
    },

    async saveArtisanGSTIN(gstin: string) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/tax-reports/gstin`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ gstin })
        });
        return res.ok ? res.json() : null;
    },

    async getAdminSettings() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/settings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : null;
    },

    async updateAdminSettings(data: any) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/settings`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return res.ok ? res.json() : null;
    },

    async getAdminFlaggedListings() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/flagged-listings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async resolveFlaggedListing(id: string, action: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/flagged-listings/${id}/resolve`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ action, status: action })
        });
        return res.ok ? res.json() : null;
    },

    async getAdminTaxReports() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/tax-reports`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async getCombos() {
        const res = await fetch(`${API_URL}/combos`);
        return res.ok ? res.json() : [];
    },

    async getPromotions() {
        const res = await fetch(`${API_URL}/promotions`);
        return res.ok ? res.json() : [];
    },


    // --- ADMIN PROMOTIONS MANAGEMENT ---
    async getAdminPromotions() {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/promotions`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async createAdminPromotion(data: any) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/promotions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return res.ok ? res.json() : null;
    },

    async toggleAdminPromotion(id: string, is_active: boolean) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/promotions/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_active })
        });
        return res.ok ? res.json() : null;
    },

    async deleteAdminPromotion(id: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/promotions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok;
    },

    // --- ADMIN COMBOS MANAGEMENT ---
    async createAdminCombo(data: any) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/combos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return res.ok ? res.json() : null;
    },



    async getAdminProducts(artisanId?: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const url = artisanId ? `${API_URL}/admin/products?artisan_id=${artisanId}` : `${API_URL}/admin/products`;
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : [];
    },

    async deleteAdminCombo(id: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/combos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok;
    },

    // --- ADMIN PAYOUT RELEASE ---
    async updateAdminPayout(id: string, status: string, admin_notes?: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/payouts/${id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status, admin_notes })
        });
        return res.ok ? res.json() : null;
    },

    // --- PRODUCT EDIT ---
    async updateProduct(id: string, data: any) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: 'Unknown server error' }));
            return { error: errorData.error || res.statusText };
        }
        return res.json();
    },

    // --- CART QUANTITY UPDATE ---
    async updateCartItemQuantity(id: string, quantity: number) {
        const token = localStorage.getItem('rifa_token');
        if (!token) return { error: 'Unauthorized' };
        const res = await fetch(`${API_URL}/cart/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity }),
        });
        return res.ok ? res.json() : null;
    },

    // --- AUTH DELETE ---
    async deleteAuthAccount() {
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

    // --- GLOBAL TOKEN EXPIRY GUARD ---
    checkTokenExpiry() {
        const token = localStorage.getItem('rifa_token');
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const isExpired = payload.exp && (Date.now() / 1000) > payload.exp;
            if (isExpired) {
                this.logout();
                window.location.href = '/auth';
                return false;
            }
            return true;
        } catch {
            return true; // Don't disrupt on parse failure
        }
    },

    // --- DISPUTES (ADMIN) ---


    async markDisputeUnderReview(id: string, admin_notes: string) {
        const token = localStorage.getItem('rifa_admin_token');
        const res = await fetch(`${API_URL}/admin/disputes/${id}/review`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ admin_notes })
        });
        return res.ok ? res.json() : null;
    },



    // --- PRODUCTS (ARTISAN) ---
    async getArtisanProductById(id: string) {
        const token = localStorage.getItem('rifa_token');
        const res = await fetch(`${API_URL}/artisan/products/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return res.ok ? res.json() : null;
    }
};
