
// ==========================================
// LYLIX SCRIPT CONFIGURATION
// Edit this file to customize your store!
// ==========================================

const LylixConfig = {
    // 1. General Settings
    storeName: "Kael",
    storeDescription: "متجر Kael وجهتك الأولى للهدايا الفاخرة، الساعات، والإكسسوارات. تسوق الآن لأفضل الهدايا لجميع المناسبات.",
    
    // 2. Contact Information
    phone: "0111 311 9058",
    email: "info@kael.com",
    address: "مصر",
    whatsappNumber: "201113119058",
    
    // 3. Integrations
    reflowProjectID: "1911270116",
    web3formsAccessKey: "585d1f02-f9d1-4a09-86f9-955c5233b239",
    
    // 4. Design & Colors
    colors: {
        primary: "#C5A059",    // Gold
        secondary: "#103C2B",  // Dark Green
        textDark: "#333333"
    },

    // 5. Dynamic Navigation Menu
    // Edit the categories and dropdowns here. It will update across the entire site automatically.
    navigation: [
        { title: "الرئيسية", url: "/" },
        { title: "تسوق الآن", url: "shop.html" },
        { title: "العروض الخاصة", url: "offers.html" },
        { title: "تسوق بالمناسبة 🎈", isDropdown: true, items: [
            { title: "أعياد الميلاد", url: "shop.html?category=birthday" },
            { title: "زواج وخطوبة", url: "shop.html?category=wedding" },
            { title: "تجهيز عرائس", url: "shop.html?category=bridal" },
            { title: "سبوع ومواليد", url: "shop.html?category=baby" },
            { title: "تخرج", url: "shop.html?category=graduation" },
            { title: "ذكرى سنوية", url: "shop.html?category=anniversary" }
        ]},
        { title: "لمن الهدية؟ 🎁", isDropdown: true, items: [
            { title: "رجالي", url: "shop.html?category=men" },
            { title: "نسائي", url: "shop.html?category=women" },
            { title: "أطفال", url: "shop.html?category=kids" }
        ]},
        { title: "الأقسام 💎", isDropdown: true, items: [
            { title: "ساعات فاخرة", url: "shop.html?category=watches" },
            { title: "إكسسوارات", url: "shop.html?category=accessories" },
            { title: "مخصصة بالاسم", url: "shop.html?category=custom" }
        ]},
        { title: "اعرض منتجاتك 🤝", url: "partners.html", highlight: true },
        { title: "تواصل معنا", url: "contact.html" }
    ]
};
