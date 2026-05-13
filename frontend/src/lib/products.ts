export type Review = {
    id: string;
    user: string;
    rating: number;
    date: string;
    comment: string;
    verified: boolean;
};

export type Product = {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    description: string;
    details: string[];
    images: string[];
    category: string;
    tag?: string;
    artisanId: string;
    isCustom?: boolean;
    isReady?: boolean;
    isNatural?: boolean;
    reviews: Review[];
};

export const products: Product[] = [
    // --- Weavers of Bengal ---
    {
        id: 'heritage-jamdani-saree',
        name: 'Heritage Hand-woven Jamdani',
        price: 8500,
        rating: 5.0,
        reviewCount: 42,
        category: 'Textiles',
        tag: 'Heritage',
        artisanId: 'weavers-of-bengal',
        isCustom: true,
        images: ['/products/earrings.png'],
        description: 'A masterpiece of patience, this Jamdani saree features motifs woven directly into the loom.',
        details: ['Material: Pure Fine Cotton', 'Weave: Traditional Jamdani'],
        reviews: []
    },
    {
        id: 'satin-ribbon-roses',
        name: 'Elegant Satin Ribbon Rose Box',
        price: 1199,
        rating: 4.7,
        reviewCount: 42,
        category: 'Satin Art',
        artisanId: 'weavers-of-bengal',
        isReady: true,
        images: ['/art_forms/satin_flowers.png'],
        description: 'Hand-folded satin ribbon roses in a luxury gift box. Perfect for anniversaries.',
        details: ['Material: Premium Satin Ribbon'],
        reviews: []
    },
    {
        id: 'bengal-cotton-stole',
        name: 'Hand-spun Cotton Stole',
        price: 2499,
        rating: 4.9,
        reviewCount: 15,
        category: 'Textiles',
        artisanId: 'weavers-of-bengal',
        isCustom: true,
        images: ['/gallery/img1.png'],
        description: 'Breathable, hand-spun cotton stole with traditional border patterns.',
        details: ['Material: 100% Khadi Cotton'],
        reviews: []
    },

    // --- Rajesh Woodworks ---
    {
        id: 'resin-ocean-frame',
        name: 'Oceanic Resin Photo Frame',
        price: 899,
        rating: 4.8,
        reviewCount: 124,
        category: 'Resin Art',
        tag: 'Best Seller',
        artisanId: 'rajesh-woodworks',
        isReady: true,
        images: ['/products/mandala.png'],
        description: 'A breathtaking handcrafted resin frame capturing the essence of ocean waves.',
        details: ['Material: Premium Epoxy Resin'],
        reviews: []
    },
    {
        id: 'teak-inlay-box',
        name: 'Tarkashi Teakwood Jewelry Box',
        price: 4500,
        rating: 5.0,
        reviewCount: 28,
        category: 'Woodwork',
        artisanId: 'rajesh-woodworks',
        isCustom: true,
        isNatural: true,
        images: ['/art_forms/resin_art.png'],
        description: 'Hand-carved teakwood box with intricate brass wire inlay work.',
        details: ['Material: Aged Teakwood'],
        reviews: []
    },
    {
        id: 'wooden-mandala-clock',
        name: 'Carved Mandala Wall Clock',
        price: 3200,
        rating: 4.6,
        reviewCount: 19,
        category: 'Woodwork',
        artisanId: 'rajesh-woodworks',
        isReady: true,
        isNatural: true,
        images: ['/products/mandala.png'],
        description: 'A precision-carved mandala design on high-quality wood.',
        details: ['Diameter: 12 inches'],
        reviews: []
    },

    // --- Jaipur Collective ---
    {
        id: 'custom-clay-tray',
        name: 'Abstract Marble Clay Trinket Tray',
        price: 499,
        rating: 4.6,
        reviewCount: 29,
        category: 'Clay Art',
        artisanId: 'jaipur-collective',
        isReady: true,
        isNatural: true,
        images: ['/art_forms/clay_art.png'],
        description: 'Hand-sculpted air-dry clay tray with a marble finish.',
        details: ['Diameter: 4 inches'],
        reviews: []
    },
    {
        id: 'blue-pottery-vase',
        name: 'Royal Blue Pottery Vase',
        price: 1899,
        rating: 4.9,
        reviewCount: 56,
        category: 'Pottery',
        artisanId: 'jaipur-collective',
        isCustom: true,
        isNatural: true,
        images: ['/products/planter.png'],
        description: 'Authentic Jaipur Blue Pottery vase with traditional cobalt motifs.',
        details: ['Material: Quartz-based Clay'],
        reviews: []
    },
    {
        id: 'block-print-tablecloth',
        name: 'Indigo Block Print Tablecloth',
        price: 2800,
        rating: 4.8,
        reviewCount: 34,
        category: 'Home Decor',
        artisanId: 'jaipur-collective',
        isCustom: true,
        images: ['/gallery/img4.png'],
        description: 'Hand-block printed tablecloth using natural vegetable dyes.',
        details: ['Size: 6-seater'],
        reviews: []
    },

    // --- Kashmiri Thread Co. ---
    {
        id: 'crochet-tulip-bouquet',
        name: 'Everlasting Crochet Tulip Bouquet',
        price: 1499,
        rating: 4.9,
        reviewCount: 86,
        category: 'Crochet',
        tag: 'New Arrival',
        artisanId: 'kashmiri-thread-co',
        isReady: true,
        images: ['/art_forms/crochet.png'],
        description: 'A bouquet that never fades. Hand-knitted with premium yarn.',
        details: ['Material: 100% Cotton Yarn'],
        reviews: []
    },
    {
        id: 'pashmina-embroidered-shawl',
        name: 'Hand-embroidered Pashmina Shawl',
        price: 12500,
        rating: 5.0,
        reviewCount: 12,
        category: 'Textiles',
        artisanId: 'kashmiri-thread-co',
        isCustom: true,
        images: ['/art_forms/bouquets.png'],
        description: 'Ultra-fine Pashmina shawl with delicate Sozni embroidery.',
        details: ['Material: 100% Pure Pashmina'],
        reviews: []
    },
    {
        id: 'aari-work-cushion',
        name: 'Aari Embroidery Cushion Cover',
        price: 1200,
        rating: 4.7,
        reviewCount: 24,
        category: 'Home Decor',
        artisanId: 'kashmiri-thread-co',
        isReady: true,
        images: ['/gallery/img2.png'],
        description: 'Traditional Kashmiri Aari work on high-quality fabric.',
        details: ['Size: 16x16 inches'],
        reviews: []
    }
];
