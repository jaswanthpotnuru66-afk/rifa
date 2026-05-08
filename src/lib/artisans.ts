export interface Artisan {
    id: string;
    name: string;
    location: string;
    specialty: string;
    productCount: string;
    story: string;
    technique: string;
    heritage: string;
    img: string;
    processImg: string;
    tags: string[];
    quote: string;
}

export const artisans: Artisan[] = [
    {
        id: "weavers-of-bengal",
        name: "Weavers of Bengal",
        location: "West Bengal, India",
        specialty: "Tant & Jamdani Weaving",
        productCount: "140+",
        story: "For generations, the weavers of this collective have preserved the ancient art of Tant and Jamdani. Each thread is hand-spun and woven on traditional pit looms, a process that can take weeks for a single masterpiece.",
        technique: "Traditional Pit Loom Weaving",
        heritage: "Over 200 years of communal weaving heritage, passed down from master to apprentice through oral tradition and hands-on practice.",
        img: "/artisans/bengal_weaver.png",
        processImg: "https://images.unsplash.com/photo-1621259182978-f09e5e2ca1ff?auto=format&fit=crop&q=80&w=1600",
        tags: ["Tant Cotton", "Hand-spun", "Heritage Art"],
        quote: "I believe that the objects we surround ourselves with should tell a story of time, patience, and human touch."
    },
    {
        id: "rajesh-woodworks",
        name: "Rajesh Woodworks",
        location: "Saharanpur, Uttar Pradesh",
        specialty: "Teakwood Inlay & Carving",
        productCount: "85+",
        story: "Master Rajesh represents the pinnacle of Saharanpur's woodworking tradition. His workshop specializes in the intricate 'Tarkashi' technique—the art of inlaying fine brass or silver wire into hard wood.",
        technique: "Tarkashi Inlay Work",
        heritage: "A family legacy starting from the royal courts, now adapted for modern home decor while maintaining imperial precision.",
        img: "/artisans/rajesh_woodworks.png",
        processImg: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=1600",
        tags: ["Teakwood", "Brass Inlay", "Imperial Craft"],
        quote: "Wood is a living canvas; our job is simply to reveal the history hidden within its grain."
    },
    {
        id: "jaipur-collective",
        name: "Jaipur Collective",
        location: "Jaipur, Rajasthan",
        specialty: "Blue Pottery & Hand-block Printing",
        productCount: "210+",
        story: "The Jaipur Collective brings together the vibrant soul of Rajasthan. From the iconic cobalt-blue pottery to the rhythmic thumping of hand-block printing, every piece captures the desert's enduring beauty.",
        technique: "Quartz-based Blue Pottery",
        heritage: "Preserving the unique Turko-Persian origins of blue pottery that found its home in the Pink City during the 19th century.",
        img: "/artisans/jaipur_pottery.png",
        processImg: "https://images.unsplash.com/photo-1565193998771-e6a2cd0606e9?auto=format&fit=crop&q=80&w=1600",
        tags: ["Blue Pottery", "Block Print", "Royal Rajasthan"],
        quote: "In the cobalt of our pottery, we capture the spirit of the Rajasthani sky—endless and full of wonder."
    },
    {
        id: "kashmiri-thread-co",
        name: "Kashmiri Thread Co.",
        location: "Srinagar, Kashmir",
        specialty: "Pashmina & Aari Embroidery",
        productCount: "55+",
        story: "In the heart of the valley, the Kashmiri Thread Co. crafts the world's finest Pashmina. Their Aari embroidery is so fine that a single shawl can represent the labor of an entire winter season.",
        technique: "Sozni & Aari Hand-Embroidery",
        heritage: "Centuries of Himalayan wisdom combined with the delicate touch required to handle the legendary 'soft gold' of Kashmir.",
        img: "/artisans/kashmir_thread.png",
        processImg: "https://images.unsplash.com/photo-1590736704728-f4730bb30770?auto=format&fit=crop&q=80&w=1600",
        tags: ["Pashmina", "Valley Silk", "Hand-embroidered"],
        quote: "Every stitch is a prayer for peace, every shawl a warm embrace from the mountains."
    }
];
