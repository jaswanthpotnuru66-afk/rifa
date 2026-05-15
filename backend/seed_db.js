import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

const artisans = [
    {
        id: "weavers-of-bengal",
        name: "Weavers of Bengal",
        location: "West Bengal, India",
        specialty: "Tant & Jamdani Weaving",
        product_count: "140+",
        story: "For generations, the weavers of this collective have preserved the ancient art of Tant and Jamdani. Each thread is hand-spun and woven on traditional pit looms, a process that can take weeks for a single masterpiece.",
        technique: "Traditional Pit Loom Weaving",
        heritage: "Over 200 years of communal weaving heritage, passed down from master to apprentice through oral tradition and hands-on practice.",
        img: "/artisans/bengal_weaver.png",
        process_img: "https://images.unsplash.com/photo-1621259182978-f09e5e2ca1ff?auto=format&fit=crop&q=80&w=1600",
        tags: ["Tant Cotton", "Hand-spun", "Heritage Art"],
        quote: "I believe that the objects we surround ourselves with should tell a story of time, patience, and human touch."
    },
    {
        id: "rajesh-woodworks",
        name: "Rajesh Woodworks",
        location: "Saharanpur, Uttar Pradesh",
        specialty: "Teakwood Inlay & Carving",
        product_count: "85+",
        story: "Master Rajesh represents the pinnacle of Saharanpur's woodworking tradition. His workshop specializes in the intricate 'Tarkashi' technique—the art of inlaying fine brass or silver wire into hard wood.",
        technique: "Tarkashi Inlay Work",
        heritage: "A family legacy starting from the royal courts, now adapted for modern home decor while maintaining imperial precision.",
        img: "/artisans/rajesh_woodworks.png",
        process_img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1600",
        tags: ["Teakwood", "Brass Inlay", "Imperial Craft"],
        quote: "Wood is a living canvas; our job is simply to reveal the history hidden within its grain."
    },
    {
        id: "jaipur-collective",
        name: "Jaipur Collective",
        location: "Jaipur, Rajasthan",
        specialty: "Blue Pottery & Hand-block Printing",
        product_count: "210+",
        story: "The Jaipur Collective brings together the vibrant soul of Rajasthan. From the iconic cobalt-blue pottery to the rhythmic thumping of hand-block printing, every piece captures the desert's enduring beauty.",
        technique: "Quartz-based Blue Pottery",
        heritage: "Preserving the unique Turko-Persian origins of blue pottery that found its home in the Pink City during the 19th century.",
        img: "/artisans/jaipur_pottery.png",
        process_img: "https://images.unsplash.com/photo-1565193998771-e6a2cd0606e9?auto=format&fit=crop&q=80&w=1600",
        tags: ["Blue Pottery", "Block Print", "Royal Rajasthan"],
        quote: "In the cobalt of our pottery, we capture the spirit of the Rajasthani sky—endless and full of wonder."
    }
];

const products = [
    {
        id: 'heritage-jamdani-saree',
        name: 'Heritage Hand-woven Jamdani',
        price: 8500,
        rating: 5.0,
        review_count: 42,
        category: 'Textiles',
        tag: 'Heritage',
        artisan_id: 'weavers-of-bengal',
        is_custom: true,
        images: ['/products/earrings.png'],
        description: 'A masterpiece of patience, this Jamdani saree features motifs woven directly into the loom.',
        details: ['Material: Pure Fine Cotton', 'Weave: Traditional Jamdani']
    },
    {
        id: 'resin-ocean-frame',
        name: 'Oceanic Resin Photo Frame',
        price: 899,
        rating: 4.8,
        review_count: 124,
        category: 'Resin Art',
        tag: 'Best Seller',
        artisan_id: 'rajesh-woodworks',
        is_ready: true,
        images: ['/products/mandala.png'],
        description: 'A breathtaking handcrafted resin frame capturing the essence of ocean waves.',
        details: ['Material: Premium Epoxy Resin']
    }
];

async function seed() {
    console.log('Seeding Artisans...');
    for (const artisan of artisans) {
        const { error } = await supabase.from('artisans').upsert(artisan);
        if (error) console.error(`Error seeding artisan ${artisan.id}:`, error.message);
        else console.log(`Seeded artisan: ${artisan.name}`);
    }

    console.log('Seeding Products...');
    for (const product of products) {
        const { error } = await supabase.from('products').upsert(product);
        if (error) console.error(`Error seeding product ${product.id}:`, error.message);
        else console.log(`Seeded product: ${product.name}`);
    }

    console.log('Seeding complete!');
}

seed();
