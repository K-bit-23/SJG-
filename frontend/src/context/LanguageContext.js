import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

const LanguageContext = createContext();

const translations = {
    English: {
        login: "Login",
        signup: "Sign Up",
        profile: "Profile",
        settings: "Settings",
        cart: "Cart",
        orders: "My Orders",
        logout: "Sign Out",
        welcome: "Elevate Your Workspace",
        home: "Home",
        contact: "Contact",
        shopbycategory: "Shop by Category",
        quickservices: "Quick Services",
        searchplaceholder: "Search products...",
        freeshipping: "Free Shipping",
        securepayment: "Secure Payment",
        support: "24/7 Support",
        viewall: "View All",
        filters: "Filters",
        category: "Category",
        pricerange: "Price Range",
        sortby: "Sort By",
        addtocart: "Add to Cart",
        outofstock: "Out of Stock",
        search: "Search",
        products: "Products",
        shopnow: "Shop Now",
        allproducts: "All Products",
        featured: "Featured",
        price_low_high: "Price: Low to High",
        price_high_low: "Price: High to Low",
        clearfilters: "Clear Filters",
        noproductsfound: "No products found",
        tryadjustingfilters: "Try adjusting your filters",
        wishlist: "Wishlist"
    },
    Tamil: {
        login: "உள்நுழைக",
        signup: "பதிவு செய்க",
        profile: "சுயவிவரம்",
        settings: "அமைப்புகள்",
        cart: "கூடை",
        orders: "எனது ஆர்டர்கள்",
        logout: "வெளியேறு",
        welcome: "உங்கள் பணியிடத்தை உயர்த்துங்கள்",
        home: "முகப்பு",
        contact: "தொடர்பு கொள்ள",
        shopbycategory: "வகைகள் மூலம் வாங்கவும்",
        quickservices: "விரைவான சேவைகள்",
        searchplaceholder: "தயாரிப்புகளைத் தேடுங்கள்...",
        freeshipping: "இலவச ஷிப்பிங்",
        securepayment: "பாதுகாப்பான கட்டணம்",
        support: "24/7 ஆதரவு",
        viewall: "அனைத்தையும் பார்",
        filters: "வடிப்பான்கள்",
        category: "வகை",
        pricerange: "விலை வரம்பு",
        sortby: "வரிசைப்படுத்து",
        addtocart: "கூடையில் சேர்",
        outofstock: "கையிருப்பில் இல்லை",
        search: "தேடு",
        products: "தயாரிப்புகள்",
        shopnow: "இப்போதே வாங்குங்கள்",
        allproducts: "அனைத்து தயாரிப்புகளும்",
        featured: "சிறப்பு",
        price_low_high: "விலை: குறைந்ததிலிருந்து அதிகம்",
        price_high_low: "விலை: அதிகதிலிருந்து குறைவு",
        clearfilters: "வடிப்பான்களை நீக்கு",
        noproductsfound: "தயாரிப்புகள் எதுவும் இல்லை",
        tryadjustingfilters: "வடிப்பான்களை மாற்ற முயற்சிக்கவும்",
        wishlist: "விருப்பப் பட்டியல்"
    },
    Hindi: {
        login: "लॉग इन करें",
        signup: "साइन अप करें",
        profile: "प्रोफ़ाइल",
        settings: "सेटिंग्स",
        cart: "कार्ट",
        orders: "मेरे आदेश",
        logout: "साइन आउट",
        welcome: "अपने कार्यक्षेत्र को बेहतर बनाएं",
        home: "होम",
        contact: "संपर्क करें",
        shopbycategory: "श्रेणी के अनुसार खरीदारी करें",
        quickservices: "त्वरित सेवाएं",
        searchplaceholder: "उत्पाद खोजें...",
        freeshipping: "मुफ़्त शिपिंग",
        securepayment: "सुरक्षित भुगतान",
        support: "24/7 सहायता",
        viewall: "सभी देखें",
        filters: "फिल्टर",
        category: "श्रेणी",
        pricerange: "मूल्य सीमा",
        sortby: "इसके अनुसार क्रमबद्ध करें",
        addtocart: "कार्ट में जोड़ें",
        outofstock: "स्टॉक में नहीं",
        search: "खोजें",
        products: "उत्पाद",
        shopnow: "अभी खरीदें",
        allproducts: "सभी उत्पाद",
        featured: "विशेष रुप से प्रदर्शित",
        price_low_high: "मूल्य: कम से उच्च",
        price_high_low: "मूल्य: उच्च से कम",
        clearfilters: "फ़िल्टर हटाएं",
        noproductsfound: "कोई उत्पाद नहीं मिला",
        tryadjustingfilters: "अपने फ़िल्टर समायोजित करने का प्रयास करें",
        wishlist: "इच्छा-सूची"
    }
};

export const LanguageProvider = ({ children }) => {
    const { user } = useAuth();
    const [language, setLanguage] = useState('English');

    useEffect(() => {
        if (user) {
            axios.get(`/api/settings/${encodeURIComponent(user.email)}/`)
                .then(res => {
                    if (res.data.language) {
                        setLanguage(res.data.language);
                    }
                })
                .catch(err => console.log("Language setting not found"));
        }
    }, [user]);

    const t = (key) => {
        return translations[language]?.[key] || translations['English'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
