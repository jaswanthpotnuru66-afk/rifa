export type OrderStatus = 'new' | 'awaiting-proof' | 'proof-sent' | 'in-production' | 'shipped' | 'delivered' | 'cancelled' | 'disputed';
export type ProofStatus = 'none' | 'sent' | 'approved' | 'revision-requested';

export interface SpecField {
    id: string;
    type: 'text' | 'dropdown' | 'image' | 'color';
    label: string;
    required: boolean;
    placeholder?: string;
    charLimit?: number;
    options?: string[];
    upcharge?: number;
    acceptedFormats?: string[];
    maxSize?: string;
    colors?: string[];
}

export interface CraftMakerListing {
    id: string;
    title: string;
    category: string;
    subCategory?: string;
    description: string;
    tags: string[];
    stateOfOrigin: string;
    images: string[];
    basePrice: number;
    compareAtPrice?: number;
    stock: number;
    isUnlimited: boolean;
    isCustomisable: boolean;
    processingTime?: number;
    specFields?: SpecField[];
    packageWeight: number;
    dimensions: { l: number; w: number; h: number };
    returnWindow: string;
    exchangeAccepted: boolean;
    status: 'active' | 'paused' | 'draft';
    views: number;
    ordersCount: number;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    sender: 'maker' | 'buyer';
    text: string;
    timestamp: string;
    read: boolean;
}

export interface ProgressUpdate {
    id: string;
    photoUrl?: string;
    caption: string;
    timestamp: string;
}

export interface CraftMakerOrder {
    id: string;
    date: string;
    buyerName: string;
    buyerCity: string;
    productName: string;
    productThumbnail: string;
    amount: number;
    shippingZone: string;
    status: OrderStatus;
    proofStatus?: ProofStatus;
    deadline?: string;
    isCustom: boolean;
    specs?: Record<string, string>;
    proofUrl?: string;
    proofSentAt?: string;
    buyerResponseAt?: string;
    revisionRound?: number;
    buyerRevisionComment?: string;
    awbNumber?: string;
    courierName?: string;
    trackingStatus?: string;
    messages: ChatMessage[];
    progressUpdates: ProgressUpdate[];
}

export interface PayoutOrder {
    id: string;
    amount: number;
    commission: number;
    tcs: number;
}

export interface Payout {
    id: string;
    date: string;
    orderCount: number;
    grossAmount: number;
    commission: number;
    tcs: number;
    shippingAdj: number;
    netPaid: number;
    status: 'paid' | 'pending' | 'held';
    orders: PayoutOrder[];
}

export interface MakerReview {
    id: string;
    buyerMasked: string;
    productName: string;
    orderId: string;
    rating: number;
    text: string;
    photos: string[];
    date: string;
    makerReply?: string;
}

export interface Dispute {
    id: string;
    orderId: string;
    buyerName: string;
    productName: string;
    category: string;
    dateRaised: string;
    status: 'open' | 'under-review' | 'resolved';
    outcome?: 'maker-favour' | 'refund-issued';
    amountDeducted?: number;
    buyerDescription: string;
    buyerPhoto?: string;
    adminRuling?: string;
    makerResponse?: string;
}

export interface ShipmentRecord {
    awb: string;
    orderId: string;
    courier: string;
    originZone: string;
    destZone: string;
    declaredWeight: number;
    billedWeight: number;
    adjustment: number;
    status: string;
}

export interface AnalyticsData {
    dateRange: string;
    kpis: {
        totalViews: number;
        totalClicks: number;
        conversionRate: string;
        avgOrderValue: number;
        repeatBuyerRate: string;
    };
    dailyRevenue: { date: string; amount: number }[];
    categoryBreakdown: { category: string; count: number }[];
    topProducts: {
        id: string;
        name: string;
        views: number;
        orders: number;
        revenue: number;
        rating: number;
    }[];
    reviewDistribution: Record<number, number>;
}

export interface TCSMonth {
    month: string;
    grossSales: number;
    tcsDeducted: number;
    netAmount: number;
}

export interface CraftMakerProfile {
    id: string;
    shopName: string;
    shopSlug: string;
    logoUrl: string;
    bannerUrl: string;
    description: string;
    originState: string;
    city: string;
    craftCategories: string[];
    status: 'active' | 'paused' | 'pending';
    processingTime: number;
    shippingOriginPin: string;
    acceptsCustomOrders: boolean;
    panMasked: string;
    bankLast4: string;
    ifsc: string;
    aadhaarMasked: string;
    mobileMasked: string;
    joinedDate: string;
    rating: number;
    reviewCount: number;
}

// --- MOCK DATA ---

export const mockMakerProfile: CraftMakerProfile = {
    id: 'm1',
    shopName: "Meera's Clay Studio",
    shopSlug: "meerasclayStudio",
    originState: "Rajasthan",
    city: "Jaipur",
    craftCategories: ["Pottery", "Blue Pottery"],
    status: "active",
    joinedDate: "12 Jan 2025",
    rating: 4.8,
    reviewCount: 143,
    processingTime: 7,
    shippingOriginPin: "302001",
    acceptsCustomOrders: true,
    panMasked: "ABCDE****F",
    bankLast4: "4321",
    ifsc: "HDFC0001234",
    aadhaarMasked: "****-****-1234",
    mobileMasked: "98****1234",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=MC&backgroundColor=1A2E36",
    bannerUrl: "https://images.unsplash.com/photo-1525498128493-380d1990a112?auto=format&fit=crop&q=80&w=1200",
    description: "Traditional hand-thrown pottery and authentic Jaipur Blue Pottery crafted with locally sourced clay and natural minerals."
};

export const mockListings: CraftMakerListing[] = [
    {
        id: 'l1',
        title: "Traditional Jaipur Blue Pottery Vase",
        category: "Blue Pottery",
        description: "Hand-painted with cobalt blue dye and intricate floral motifs. A centerpiece for any heritage-inspired home.",
        tags: ["Blue Pottery", "Jaipur", "Hand-painted"],
        stateOfOrigin: "Rajasthan",
        images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"],
        basePrice: 2450,
        stock: 12,
        isUnlimited: false,
        isCustomisable: false,
        packageWeight: 800,
        dimensions: { l: 15, w: 15, h: 25 },
        returnWindow: "7 days",
        exchangeAccepted: true,
        status: 'active',
        views: 1240,
        ordersCount: 45,
        createdAt: "15 Jan 2025"
    },
    {
        id: 'l2',
        title: "Bespoke Terracotta Wall Plate",
        category: "Pottery",
        description: "Personalized wall plate with your initials and choice of traditional border art.",
        tags: ["Custom", "Wall Decor", "Pottery"],
        stateOfOrigin: "Rajasthan",
        images: ["https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800"],
        basePrice: 1800,
        stock: 0,
        isUnlimited: true,
        isCustomisable: true,
        specFields: [
            { id: 'f1', type: 'text', label: 'Initials to Engrave', required: true, charLimit: 3, placeholder: 'ABC' },
            { id: 'f2', type: 'dropdown', label: 'Border Style', required: true, options: ['Lotus', 'Peacock', 'Geometric'] }
        ],
        packageWeight: 500,
        dimensions: { l: 20, w: 20, h: 3 },
        returnWindow: "No returns",
        exchangeAccepted: false,
        status: 'active',
        views: 890,
        ordersCount: 22,
        createdAt: "20 Jan 2025"
    },
    {
        id: 'l3',
        title: "Earthy Ceramic Bowl Set (4pcs)",
        category: "Pottery",
        description: "Minimalist ceramic bowls with a textured matte finish. Perfect for artisanal dining.",
        tags: ["Tableware", "Ceramic", "Modern"],
        stateOfOrigin: "Rajasthan",
        images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"],
        basePrice: 3200,
        stock: 5,
        isUnlimited: false,
        isCustomisable: false,
        packageWeight: 1200,
        dimensions: { l: 20, w: 20, h: 10 },
        returnWindow: "7 days",
        exchangeAccepted: true,
        status: 'paused',
        views: 450,
        ordersCount: 8,
        createdAt: "02 Feb 2025"
    },
    {
        id: 'l4',
        title: "Custom Blue Pottery Nameplate",
        category: "Blue Pottery",
        description: "Elegant nameplate for your home entrance, hand-painted in traditional cobalt blue.",
        tags: ["Home Entrance", "Nameplate", "Custom"],
        stateOfOrigin: "Rajasthan",
        images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"],
        basePrice: 4500,
        stock: 0,
        isUnlimited: true,
        isCustomisable: true,
        specFields: [
            { id: 'f3', type: 'text', label: 'Name to Display', required: true, charLimit: 20, placeholder: 'The Sharmas' },
            { id: 'f4', type: 'color', label: 'Background Tint', required: true, colors: ['#0047AB', '#87CEEB', '#FFFFFF'] }
        ],
        packageWeight: 1500,
        dimensions: { l: 30, w: 20, h: 2 },
        returnWindow: "No returns",
        exchangeAccepted: false,
        status: 'active',
        views: 2100,
        ordersCount: 56,
        createdAt: "10 Jan 2025"
    },
    {
        id: 'l5',
        title: "Unglazed Terracotta Water Pitcher",
        category: "Pottery",
        description: "Natural cooling pitcher made from organic Jaipur clay.",
        tags: ["Traditional", "Kitchen", "Healthy"],
        stateOfOrigin: "Rajasthan",
        images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"],
        basePrice: 750,
        stock: 25,
        isUnlimited: false,
        isCustomisable: false,
        packageWeight: 2000,
        dimensions: { l: 18, w: 18, h: 30 },
        returnWindow: "3 days",
        exchangeAccepted: true,
        status: 'active',
        views: 560,
        ordersCount: 15,
        createdAt: "25 Feb 2025"
    },
    {
        id: 'l6',
        title: "Miniature Pottery Trinket Box",
        category: "Pottery",
        description: "Small hand-painted box for jewelry and small treasures.",
        tags: ["Gifting", "Trinket", "Miniature"],
        stateOfOrigin: "Rajasthan",
        images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"],
        basePrice: 280,
        stock: 50,
        isUnlimited: false,
        isCustomisable: false,
        packageWeight: 150,
        dimensions: { l: 5, w: 5, h: 5 },
        returnWindow: "7 days",
        exchangeAccepted: true,
        status: 'draft',
        views: 12,
        ordersCount: 0,
        createdAt: "10 Mar 2025"
    },
    {
        id: 'l7',
        title: "Custom Portrait Clay Figurine",
        category: "Custom Orders",
        description: "A personalized miniature clay sculpture based on your photo.",
        tags: ["Portrait", "Sculpture", "Custom"],
        stateOfOrigin: "Rajasthan",
        images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"],
        basePrice: 3800,
        stock: 0,
        isUnlimited: true,
        isCustomisable: true,
        specFields: [
            { id: 'f5', type: 'image', label: 'Reference Photo', required: true },
            { id: 'f6', type: 'text', label: 'Special Instructions', required: false, charLimit: 200 }
        ],
        packageWeight: 400,
        dimensions: { l: 10, w: 10, h: 15 },
        returnWindow: "No returns",
        exchangeAccepted: false,
        status: 'active',
        views: 3400,
        ordersCount: 89,
        createdAt: "05 Jan 2025"
    },
    {
        id: 'l8',
        title: "Hand-painted Ceramic Coffee Mug",
        category: "Pottery",
        description: "Your name hand-painted on a high-fired ceramic mug.",
        tags: ["Mug", "Personalized", "Kitchen"],
        stateOfOrigin: "Rajasthan",
        images: ["https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"],
        basePrice: 1200,
        stock: 0,
        isUnlimited: true,
        isCustomisable: true,
        specFields: [
            { id: 'f7', type: 'text', label: 'Name', required: true, charLimit: 12 },
            { id: 'f8', type: 'color', label: 'Handle Color', required: true, colors: ['#C4603A', '#4A8C6F', '#1A2E36'] }
        ],
        packageWeight: 400,
        dimensions: { l: 12, w: 10, h: 10 },
        returnWindow: "No returns",
        exchangeAccepted: false,
        status: 'active',
        views: 1560,
        ordersCount: 42,
        createdAt: "18 Feb 2025"
    }
];

export const mockOrders: CraftMakerOrder[] = [
    {
        id: 'ORD-9912',
        date: '10 May 2025',
        buyerName: "R***a · Mumbai",
        buyerCity: "Mumbai",
        productName: "Heritage Jamdani Saree",
        productThumbnail: "https://images.unsplash.com/photo-1601633535921-6923bbdebb78?auto=format&fit=crop&q=80&w=800",
        amount: 8500,
        shippingZone: "Zone D",
        status: 'delivered',
        isCustom: false,
        messages: [],
        progressUpdates: []
    },
    {
        id: 'ORD-9956',
        date: '11 May 2025',
        buyerName: "P***l · Delhi",
        buyerCity: "Delhi",
        productName: "Custom Blue Pottery Nameplate",
        productThumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        amount: 4500,
        shippingZone: "Zone A",
        status: 'proof-sent',
        proofStatus: 'sent',
        deadline: '13 May 2025 22:00',
        isCustom: true,
        specs: {
            'Name to Display': 'The Sharmas',
            'Background Tint': '#0047AB'
        },
        proofUrl: '/products/pottery.png',
        proofSentAt: '12 May 2025 10:00',
        messages: [
            { id: 'm1', sender: 'buyer', text: 'Please make sure the font is traditional.', timestamp: '11 May 2025 14:00', read: true },
            { id: 'm2', sender: 'maker', text: 'Sure, I will use a classic Serif font.', timestamp: '11 May 2025 14:30', read: true }
        ],
        progressUpdates: []
    },
    {
        id: 'ORD-9988',
        date: '12 May 2025',
        buyerName: "A***i · Bengaluru",
        buyerCity: "Bengaluru",
        productName: "Bespoke Terracotta Wall Plate",
        productThumbnail: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800",
        amount: 1800,
        shippingZone: "Zone C",
        status: 'awaiting-proof',
        proofStatus: 'none',
        isCustom: true,
        specs: {
            'Initials to Engrave': 'ASK',
            'Border Style': 'Lotus'
        },
        messages: [],
        progressUpdates: []
    },
    {
        id: 'ORD-9990',
        date: '12 May 2025',
        buyerName: "S***h · Jaipur",
        buyerCity: "Jaipur",
        productName: "Unglazed Terracotta Water Pitcher",
        productThumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        amount: 750,
        shippingZone: "Zone A",
        status: 'new',
        isCustom: false,
        messages: [],
        progressUpdates: []
    },
    {
        id: 'ORD-9942',
        date: '08 May 2025',
        buyerName: "V***k · Pune",
        buyerCity: "Pune",
        productName: "Custom Portrait Clay Figurine",
        productThumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        amount: 3800,
        shippingZone: "Zone B",
        status: 'proof-sent',
        proofStatus: 'revision-requested',
        revisionRound: 2,
        buyerRevisionComment: "The nose needs to be a bit sharper. Please see the reference photo again.",
        isCustom: true,
        specs: {
            'Reference Photo': 'link-to-photo',
            'Special Instructions': 'Make it look happy'
        },
        proofUrl: '/products/pottery.png',
        messages: [
            { id: 'm3', sender: 'buyer', text: 'Can you adjust the facial features?', timestamp: '09 May 2025 11:00', read: true }
        ],
        progressUpdates: []
    },
    {
        id: 'ORD-9930',
        date: '05 May 2025',
        buyerName: "M***a · Chennai",
        buyerCity: "Chennai",
        productName: "Blue Pottery Vase",
        productThumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        amount: 2450,
        shippingZone: "Zone E",
        status: 'in-production',
        isCustom: false,
        messages: [],
        progressUpdates: [
            { id: 'p1', caption: 'Shaping the clay base.', timestamp: '07 May 2025 09:00' }
        ]
    },
    {
        id: 'ORD-9925',
        date: '02 May 2025',
        buyerName: "K***n · Hyderabad",
        buyerCity: "Hyderabad",
        productName: "Ceramic Bowl Set",
        productThumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        amount: 3200,
        shippingZone: "Zone C",
        status: 'shipped',
        awbNumber: 'RIFA12345678',
        courierName: 'Delhivery',
        trackingStatus: 'In Transit',
        isCustom: false,
        messages: [],
        progressUpdates: []
    },
    {
        id: 'ORD-9910',
        date: '01 May 2025',
        buyerName: "J***i · Kolkata",
        buyerCity: "Kolkata",
        productName: "Terracotta Pitcher",
        productThumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        amount: 750,
        shippingZone: "Zone B",
        status: 'cancelled',
        isCustom: false,
        messages: [],
        progressUpdates: []
    },
    {
        id: 'ORD-9905',
        date: '28 Apr 2025',
        buyerName: "H***a · Gurgaon",
        buyerCity: "Gurgaon",
        productName: "Custom Mug",
        productThumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        amount: 1200,
        shippingZone: "Zone A",
        status: 'disputed',
        isCustom: true,
        messages: [],
        progressUpdates: []
    },
    {
        id: 'ORD-9900',
        date: '25 Apr 2025',
        buyerName: "D***k · Ahmedabad",
        buyerCity: "Ahmedabad",
        productName: "Blue Pottery Vase",
        productThumbnail: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800",
        amount: 2450,
        shippingZone: "Zone B",
        status: 'delivered',
        isCustom: false,
        messages: [],
        progressUpdates: []
    }
];

export const mockPayouts: Payout[] = [
    {
        id: 'PAY-001',
        date: '15 May 2025',
        orderCount: 3,
        grossAmount: 14200,
        commission: 710,
        tcs: 142,
        shippingAdj: 0,
        netPaid: 13348,
        status: 'paid',
        orders: [
            { id: 'ORD-9912', amount: 8500, commission: 425, tcs: 85 },
            { id: 'ORD-9930', amount: 2450, commission: 122, tcs: 24 },
            { id: 'ORD-9925', amount: 3200, commission: 160, tcs: 32 }
        ]
    },
    {
        id: 'PAY-002',
        date: '01 May 2025',
        orderCount: 2,
        grossAmount: 3200,
        commission: 160,
        tcs: 32,
        shippingAdj: -135,
        netPaid: 2873,
        status: 'paid',
        orders: [
            { id: 'ORD-9900', amount: 2450, commission: 122, tcs: 24 },
            { id: 'ORD-9880', amount: 750, commission: 38, tcs: 8 }
        ]
    },
    {
        id: 'PAY-003',
        date: '15 Apr 2025',
        orderCount: 4,
        grossAmount: 12800,
        commission: 640,
        tcs: 128,
        shippingAdj: 0,
        netPaid: 12032,
        status: 'paid',
        orders: []
    },
    {
        id: 'PAY-004',
        date: '30 May 2025',
        orderCount: 2,
        grossAmount: 5250,
        commission: 262,
        tcs: 52,
        shippingAdj: 0,
        netPaid: 4936,
        status: 'pending',
        orders: []
    },
    {
        id: 'PAY-005',
        date: '20 May 2025',
        orderCount: 1,
        grossAmount: 1200,
        commission: 60,
        tcs: 12,
        shippingAdj: 0,
        netPaid: 1128,
        status: 'held',
        orders: [
            { id: 'ORD-9905', amount: 1200, commission: 60, tcs: 12 }
        ]
    }
];

export const mockReviews: MakerReview[] = [
    {
        id: 'rv1',
        buyerMasked: "R***a · Mumbai",
        productName: "Heritage Jamdani Saree",
        orderId: 'ORD-9912',
        rating: 5,
        text: "Absolutely stunning craftsmanship. The texture and motifs are even better in person.",
        photos: ["https://images.unsplash.com/photo-1601633535921-6923bbdebb78?auto=format&fit=crop&q=80&w=800"],
        date: "14 May 2025",
        makerReply: "Thank you so much! We are glad you liked the traditional hand-weaving."
    },
    {
        id: 'rv2',
        buyerMasked: "P***l · Delhi",
        productName: "Blue Pottery Vase",
        orderId: 'ORD-9900',
        rating: 5,
        text: "Beautiful piece of art. It arrived very well packaged.",
        photos: [],
        date: "10 May 2025"
    },
    {
        id: 'rv3',
        buyerMasked: "V***k · Pune",
        productName: "Terracotta Pitcher",
        orderId: 'ORD-9880',
        rating: 4,
        text: "Good quality clay. The cooling is natural and effective.",
        photos: [],
        date: "05 May 2025",
        makerReply: "Happy to serve you. These unglazed pitchers are best for natural cooling."
    },
    { id: 'rv4', buyerMasked: "A***i · Bengaluru", productName: "Wall Plate", orderId: 'ORD-9870', rating: 5, text: "Exquisite details.", photos: [], date: "02 May 2025" },
    { id: 'rv5', buyerMasked: "S***h · Jaipur", productName: "Water Pitcher", orderId: 'ORD-9860', rating: 5, text: "Local favorite!", photos: [], date: "30 Apr 2025" },
    { id: 'rv6', buyerMasked: "M***a · Chennai", productName: "Mug Set", orderId: 'ORD-9850', rating: 3, text: "Smaller than expected.", photos: [], date: "28 Apr 2025", makerReply: "Sorry about that. We list the dimensions in the description for reference." },
    { id: 'rv7', buyerMasked: "K***n · Hyderabad", productName: "Bowl Set", orderId: 'ORD-9840', rating: 5, text: "Perfect set.", photos: [], date: "25 Apr 2025" },
    { id: 'rv8', buyerMasked: "J***i · Kolkata", productName: "Blue Pottery", orderId: 'ORD-9830', rating: 4, text: "Classic look.", photos: [], date: "20 Apr 2025" },
    { id: 'rv9', buyerMasked: "H***a · Gurgaon", productName: "Figurine", orderId: 'ORD-9820', rating: 5, text: "Highly detailed.", photos: [], date: "15 Apr 2025" },
    { id: 'rv10', buyerMasked: "D***k · Ahmedabad", productName: "Clay Pot", orderId: 'ORD-9810', rating: 3, text: "Bit rough finish.", photos: [], date: "10 Apr 2025" },
    { id: 'rv11', buyerMasked: "G***u · Noida", productName: "Vase", orderId: 'ORD-9800', rating: 5, text: "Magnificent.", photos: [], date: "05 Apr 2025", makerReply: "Thanks!" },
    { id: 'rv12', buyerMasked: "T***u · Kochi", productName: "Pottery", orderId: 'ORD-9790', rating: 4, text: "Very artistic.", photos: [], date: "01 Apr 2025" }
];

export const mockTCSData: TCSMonth[] = [
    { month: 'Jun 2025', grossSales: 42000, tcsDeducted: 420, netAmount: 41580 },
    { month: 'May 2025', grossSales: 35000, tcsDeducted: 350, netAmount: 34650 },
    { month: 'Apr 2025', grossSales: 28000, tcsDeducted: 280, netAmount: 27720 },
    { month: 'Mar 2025', grossSales: 22000, tcsDeducted: 220, netAmount: 21780 },
    { month: 'Feb 2025', grossSales: 18000, tcsDeducted: 180, netAmount: 17820 },
    { month: 'Jan 2025', grossSales: 12000, tcsDeducted: 120, netAmount: 11880 }
];

export const mockAnalyticsData: AnalyticsData = {
    dateRange: "Last 30 Days",
    kpis: {
        totalViews: 3240,
        totalClicks: 891,
        conversionRate: "2.8%",
        avgOrderValue: 1240,
        repeatBuyerRate: "18%"
    },
    dailyRevenue: [
        { date: '01 May', amount: 1200 }, { date: '02 May', amount: 3200 }, { date: '03 May', amount: 0 },
        { date: '04 May', amount: 450 }, { date: '05 May', amount: 2450 }, { date: '06 May', amount: 1800 },
        { date: '07 May', amount: 0 }, { date: '08 May', amount: 3800 }, { date: '09 May', amount: 750 },
        { date: '10 May', amount: 8500 }, { date: '11 May', amount: 4500 }, { date: '12 May', amount: 3200 }
    ],
    categoryBreakdown: [
        { category: 'Blue Pottery', count: 45 },
        { category: 'Pottery', count: 32 },
        { category: 'Custom Orders', count: 18 },
        { category: 'Other', count: 5 }
    ],
    topProducts: [
        { id: 'l7', name: 'Portrait Clay Figurine', views: 3400, orders: 89, revenue: 338200, rating: 4.9 },
        { id: 'l4', name: 'Blue Pottery Nameplate', views: 2100, orders: 56, revenue: 252000, rating: 4.8 },
        { id: 'l1', name: 'Blue Pottery Vase', views: 1240, orders: 45, revenue: 110250, rating: 5.0 },
        { id: 'l8', name: 'Ceramic Mug', views: 1560, orders: 42, revenue: 50400, rating: 4.7 },
        { id: 'l2', name: 'Terracotta Wall Plate', views: 890, orders: 22, revenue: 39600, rating: 4.6 }
    ],
    reviewDistribution: { 5: 87, 4: 38, 3: 12, 2: 4, 1: 2 }
};

export const mockDisputes: Dispute[] = [
    {
        id: 'DISP-001',
        orderId: 'ORD-9905',
        buyerName: "H***a · Gurgaon",
        productName: "Custom Mug",
        category: "Product mismatch",
        dateRaised: "10 May 2025",
        status: 'open',
        buyerDescription: "The color of the handle is much darker than the one I picked.",
        buyerPhoto: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 'DISP-002',
        orderId: 'ORD-9850',
        buyerName: "M***a · Chennai",
        productName: "Mug Set",
        category: "Incorrect sizing",
        dateRaised: "28 Apr 2025",
        status: 'under-review',
        buyerDescription: "The bowls are too small to be used for soup as advertised."
    },
    {
        id: 'DISP-003',
        orderId: 'ORD-9700',
        buyerName: "S***n · Delhi",
        productName: "Vase",
        category: "Damaged on arrival",
        dateRaised: "15 Apr 2025",
        status: 'resolved',
        outcome: 'refund-issued',
        amountDeducted: 1500,
        buyerDescription: "The vase was cracked upon opening the box.",
        adminRuling: "Evidence confirms shipping damage. Refund issued to buyer from maker payout."
    }
];

export const mockShipments: ShipmentRecord[] = [
    { awb: 'RIFA1001', orderId: 'ORD-9925', courier: 'Delhivery', originZone: 'Zone A', destZone: 'Zone C', declaredWeight: 1200, billedWeight: 1200, adjustment: 0, status: 'In Transit' },
    { awb: 'RIFA1002', orderId: 'ORD-9912', courier: 'BlueDart', originZone: 'Zone A', destZone: 'Zone D', declaredWeight: 800, billedWeight: 1050, adjustment: -135, status: 'Delivered' },
    { awb: 'RIFA1003', orderId: 'ORD-9930', courier: 'XpressBees', originZone: 'Zone A', destZone: 'Zone E', declaredWeight: 2000, billedWeight: 2000, adjustment: 0, status: 'Picked Up' },
    { awb: 'RIFA1004', orderId: 'ORD-9900', courier: 'Delhivery', originZone: 'Zone A', destZone: 'Zone B', declaredWeight: 800, billedWeight: 800, adjustment: 0, status: 'Delivered' },
    { awb: 'RIFA1005', orderId: 'ORD-9880', courier: 'Ecom Express', originZone: 'Zone A', destZone: 'Zone A', declaredWeight: 2000, billedWeight: 2500, adjustment: -180, status: 'Delivered' }
];
