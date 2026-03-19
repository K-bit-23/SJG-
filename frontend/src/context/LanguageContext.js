import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Try to get language from localStorage, default to 'English'
    const [language, setLanguageState] = useState(localStorage.getItem('language') || 'English');

    const setLanguage = (lang) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const translations = {
        'English': {
            // General
            home: "Home",
            products: "Products",
            about: "About",
            contact: "Contact",
            search: "Search",
            searchplaceholder: "Search products...",
            shopnow: "Shop Now",
            viewall: "View All",
            welcome: "Welcome",
            featured: "Featured",
            price_low_high: "Price: Low to High",
            price_high_low: "Price: High to Low",
            addtocart: "Add to Cart",
            filters: "Filters",
            category: "Category",
            sortby: "Sort By",
            allproducts: "All Products",
            outofstock: "Out of Stock",
            noproductsfound: "No products found",
            tryadjustingfilters: "Try adjusting your filters",
            clearfilters: "Clear Filters",
            viewdetails: "View Details",

            // Navbar
            cart: "Cart",
            wishlist: "Wishlist",
            login: "Login",
            profile: "Profile",
            logout: "Logout",

            // Payment Success
            payment_success: "Payment Successful!",
            order_confirmed: "Your order has been confirmed. We'll contact you soon.",
            redirecting: "Redirecting to home...",
            order_id: "Order ID",
            amount_paid: "Amount Paid",
            payment_method: "Payment Method",
            thank_you: "Thank you for shopping with us!",

            // Home
            limitedoffer: "Limited Time Offer",
            getoff: "Get 20% off on your first order",
            usecode: "Use code SJG20 at checkout. Valid on all products.",
            whatweoffer: "What We Offer",
            ourservices: "Our Services",
            readytostock: "Ready to stock up?",
            browsefullrange: "Browse our full range of stationery and office essentials. Fast delivery across Tamil Nadu.",
            browseproducts: "Browse Products",
            contactus: "Contact Us",

            // Cart
            shoppingcart: "Shopping Cart",
            itemsincart: "items in your cart",
            clearall: "Clear All",
            cartempty: "Your cart is empty",
            cartempty_desc: "Looks like you haven't added anything to your cart yet. Start shopping to fill it up!",
            startshopping: "Start Shopping",
            continueshopping: "Continue Shopping",
            ordersummary: "Order Summary",
            couponcode: "Coupon Code",
            enter_code: "Enter code",
            apply: "Apply",
            applied: "Applied!",
            subtotal: "Subtotal",
            shipping: "Shipping",
            total: "Total",
            proceed: "Proceed to Checkout",
            free: "FREE",
            addmoreforfree: "Add ₹{amount} more for FREE shipping!",
            freeshipping: "Free Delivery",
            securepayment: "Secure Payments",
            support: "24/7 Support",

            // Wishlist
            mywishlist: "My Wishlist",
            itemssaved: "items saved",
            wishlistempty: "Your wishlist is empty",
            wishlistempty_desc: "Save items you love by clicking the heart icon on products. They'll appear here!",
            browseproducts: "Browse Products",
            add: "Add",

            // Contact
            getintouch: "Get in Touch",
            contact_desc: "Have questions about our products or need a custom order? We're here to help you elevate your workspace.",
            phone: "Phone",
            email: "Email",
            visitus: "Visit Us",
            sendmessage: "Send Message",
            fullname: "Full Name",
            emailaddress: "Email Address",
            message: "Message",
            sending: "Sending...",
            msg_success: "Message sent successfully! We'll get back to you soon.",
            msg_error: "Failed to send message. Please try again.",

            // Footer
            footer_desc: "Elevating your workspace with premium stationery. Quality, aesthetics, and functionality in every product.",
            stayupdated: "Stay Updated",
            newsletter_desc: "Subscribe for exclusive offers and new arrivals.",
            join: "Join",
            allrights: "All rights reserved.",
            privacypolicy: "Privacy Policy",
            terms: "Terms of Service",
        },
        'Tamil': {
            // General
            home: "முகப்பு",
            products: "தயாரிப்புகள்",
            about: "எங்களைப் பற்றி",
            contact: "தொடர்பு",
            search: "தேடுக",
            searchplaceholder: "தயாரிப்புகளைத் தேடுங்கள்...",
            shopnow: "இப்போதே வாங்குங்கள்",
            viewall: "அனைத்தையும் பார்",
            welcome: "வரவேற்கிறோம்",
            featured: "சிறப்பம்சங்கள்",
            price_low_high: "விலை: குறைந்ததிலிருந்து அதிகத்திற்கு",
            price_high_low: "விலை: அதிகத்திலிருந்து குறைந்ததிற்கு",
            addtocart: "வண்டியில் சேர்",
            filters: "வடிகட்டிகள்",
            category: "வகை",
            sortby: "வரிசைப்படுத்து",
            allproducts: "அனைத்து தயாரிப்புகள்",
            outofstock: "கையிருப்பில் இல்லை",
            noproductsfound: "தயாரிப்புகள் எதுவும் கிடைக்கவில்லை",
            tryadjustingfilters: "வடிகட்டிகளை மாற்றி முயற்சிக்கவும்",
            clearfilters: "வடிகட்டிகளை நீக்கு",
            viewdetails: "விவரங்களைப் பார்",

            // Navbar
            cart: "வண்டி",
            wishlist: "விருப்பப்பட்டியல்",
            login: "உள்நுழைய",
            profile: "சுயவிவரம்",
            logout: "வெளியேறு",

            // Payment Success
            payment_success: "கட்டணம் வெற்றிகரமாக முடிந்தது!",
            order_confirmed: "உங்கள் ஆர்டர் உறுதி செய்யப்பட்டது. விரைவில் உங்களைத் தொடர்பு கொள்கிறோம்.",
            redirecting: "முகப்புப் பக்கத்திற்குத் திரும்புகிறது...",
            order_id: "ஆர்டர் ஐடி",
            amount_paid: "செலுத்தப்பட்ட தொகை",
            payment_method: "கட்டண முறை",
            thank_you: "எங்களுடன் இணைந்தமைக்கு நன்றி!",

            // Home
            limitedoffer: "வரையறுக்கப்பட்ட கால சலுகை",
            getoff: "உங்கள் முதல் ஆர்டரில் 20% தள்ளுபடி பெறுங்கள்",
            usecode: "செக் அவுட்டில் SJG20 குறியீட்டைப் பயன்படுத்தவும். அனைத்து தயாரிப்புகளுக்கும் பொருந்தும்.",
            whatweoffer: "நாங்கள் வழங்குபவை",
            ourservices: "எங்கள் சேவைகள்",
            readytostock: "தயாராக இருக்கிறீர்களா?",
            browsefullrange: "எங்கள் முழு தயாரிப்புகளையும் பாருங்கள். தமிழ்நாடு முழுவதும் விரைவான டெலிவரி.",
            browseproducts: "தயாரிப்புகளைப் பார்",
            contactus: "எங்களைத் தொடர்பு கொள்க",

            // Cart
            shoppingcart: "ஷாப்பிங் வண்டி",
            itemsincart: "உங்கள் வண்டியில் உள்ள பொருட்கள்",
            clearall: "அனைத்தையும் நீக்கு",
            cartempty: "உங்கள் வண்டி காலியாக உள்ளது",
            cartempty_desc: "உங்கள் வண்டியில் இன்னும் எதுவும் சேர்க்கப்படவில்லை. வாங்கத் தொடங்குங்கள்!",
            startshopping: "வாங்கத் தொடங்குங்கள்",
            continueshopping: "தொடர்ந்து வாங்கவும்",
            ordersummary: "ஆர்டர் சுருக்கம்",
            couponcode: "தள்ளுபடி குறியீடு",
            enter_code: "குறியீட்டை உள்ளிடவும்",
            apply: "பயன்படுத்து",
            applied: "பயன்படுத்தப்பட்டது!",
            subtotal: "ஆர்டர் தொகை",
            shipping: "டெலிவரி கட்டணம்",
            total: "மொத்தம்",
            proceed: "ஆர்டர் செய்ய தொடரவும்",
            free: "இலவசம்",
            addmoreforfree: "இலவச டெலிவரிக்கு இன்னும் ₹{amount} சேர்க்கவும்!",
            freeshipping: "இலவச டெலிவரி",
            securepayment: "பாதுகாப்பான கட்டணம்",
            support: "24/7 ஆதரவு",

            // Wishlist
            mywishlist: "எனது விருப்பப்பட்டியல்",
            itemssaved: "பொருட்கள் சேமிக்கப்பட்டுள்ளன",
            wishlistempty: "உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது",
            wishlistempty_desc: "உங்களுக்குப் பிடித்த பொருட்களை இதயக் குறியீட்டை அழுத்திச் சேமிக்கவும். அவை இங்கே தோன்றும்!",
            browseproducts: "தயாரிப்புகளைப் பார்",
            add: "சேர்",

            // Contact
            getintouch: "தொடர்பு கொள்ள",
            contact_desc: "எங்கள் தயாரிப்புகளைப் பற்றி கேள்விகள் உள்ளதா அல்லது தனிப்பயன் ஆர்டர் தேவையா? உங்கள் பணியிடத்தை மேம்படுத்த உங்களுக்கு உதவ நாங்கள் இங்கே இருக்கிறோம்.",
            phone: "தொலைபேசி",
            email: "மின்னஞ்சல்",
            visitus: "நேரில் வர",
            sendmessage: "செய்தி அனுப்பு",
            fullname: "முழு பெயர்",
            emailaddress: "மின்னஞ்சல் முகவரி",
            message: "செய்தி",
            sending: "அனுப்பப்படுகிறது...",
            msg_success: "செய்தி வெற்றிகரமாக அனுப்பப்பட்டது! விரைவில் உங்களைத் தொடர்பு கொள்கிறோம்.",
            msg_error: "செய்தி அனுப்புவதில் தோல்வி. மீண்டும் முயற்சிக்கவும்.",

            // Footer
            footer_desc: "பிரீமியம் ஸ்டேஷனரி மூலம் உங்கள் பணியிடத்தை மேம்படுத்தவும். ஒவ்வொரு தயாரிப்பிலும் தரம் மற்றும் பயன்.",
            stayupdated: "புதுப்பித்த நிலையில் இருங்கள்",
            newsletter_desc: "தனிப்பட்ட சலுகைகள் மற்றும் புதிய தயாரிப்புகளுக்கு குழுசேரவும்.",
            join: "சேர்",
            allrights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
            privacypolicy: "தனியுரிமைக் கொள்கை",
            terms: "சேவை விதிகள்",
        },
        'Hindi': {
            // General
            home: "होम",
            products: "उत्पाद",
            about: "हमारे बारे में",
            contact: "संपर्क",
            search: "खोजें",
            searchplaceholder: "उत्पाद खोजें...",
            shopnow: "अभी खरीदें",
            viewall: "सभी देखें",
            welcome: "स्वागत है",
            featured: "विशेष",
            price_low_high: "कीमत: कम से अधिक",
            price_high_low: "कीमत: अधिक से कम",
            addtocart: "कार्ट में जोड़ें",
            filters: "फ़िल्टर",
            category: "श्रेणी",
            sortby: "क्रमबद्ध करें",
            allproducts: "सभी उत्पाद",
            outofstock: "स्टॉक में नहीं है",
            noproductsfound: "कोई उत्पाद नहीं मिला",
            tryadjustingfilters: "फ़िल्टर बदलने का प्रयास करें",
            clearfilters: "फ़िल्टर हटाएं",
            viewdetails: "विवरण देखें",

            // Navbar
            cart: "कार्ट",
            wishlist: "विशलिस्ट",
            login: "लॉगिन",
            profile: "प्रोफ़ाइल",
            logout: "लॉगआउट",

            // Payment Success
            payment_success: "भुगतान सफल रहा!",
            order_confirmed: "आपका ऑर्डर पुष्ट हो गया है। हम जल्द ही आपसे संपर्क करेंगे।",
            redirecting: "होम पेज पर वापस जा रहे हैं...",
            order_id: "ऑर्डर आईडी",
            amount_paid: "भुगतान की गई राशि",
            payment_method: "भुगतान विधि",
            thank_you: "हमारे साथ जुड़ने के लिए धन्यवाद!",

            // Home
            limitedoffer: "सीमित समय का ऑफर",
            getoff: "अपने पहले ऑर्डर पर 20% की छूट पाएं",
            usecode: "चेकआउट पर SJG20 कोड का उपयोग करें। सभी उत्पादों पर मान्य।",
            whatweoffer: "हम क्या प्रदान करते हैं",
            ourservices: "हमारी सेवाएँ",
            readytostock: "क्या आप तैयार हैं?",
            browsefullrange: "स्टेशनरी और कार्यालय की आवश्यक वस्तुओं की हमारी पूरी श्रृंखला ब्राउज़ करें। पूरे तमिलनाडु में तेज़ डिलीवरी।",
            browseproducts: "उत्पाद ब्राउज़ करें",
            contactus: "संपर्क करें",

            // Cart
            shoppingcart: "शपनिंग कार्ट",
            itemsincart: "आपकी कार्ट में आइटम",
            clearall: "सब साफ़ करें",
            cartempty: "आपकी कार्ट खाली है",
            cartempty_desc: "ऐसा लगता है कि आपने अभी तक आपकी कार्ट में कुछ भी नहीं जोड़ा है। खरीदारी शुरू करें!",
            startshopping: "खरीदारी शुरू करें",
            continueshopping: "खरीदारी जारी रखें",
            ordersummary: "ऑर्डर सारांश",
            couponcode: "कूपन कोड",
            enter_code: "कोड दर्ज करें",
            apply: "लागू करें",
            applied: "लागू!",
            subtotal: "उप-योग",
            shipping: "शिपिंग",
            total: "कुल",
            proceed: "चेकआउट पर आगे बढ़ें",
            free: "मुफ्त",
            addmoreforfree: "मुफ्त शिपिंग के लिए ₹{amount} और जोड़ें!",
            freeshipping: "मुफ्त डिलीवरी",
            securepayment: "सुरक्षित भुगतान",
            support: "24/7 सहायता",

            // Wishlist
            mywishlist: "मेरी विशलिस्ट",
            itemssaved: "आइटम सहेजे गए",
            wishlistempty: "आपकी विशलिस्ट खाली है",
            wishlistempty_desc: "उत्पादों पर दिल के आइकन पर क्लिक करके अपने पसंदीदा आइटम सहेजें। वे यहाँ दिखाई देंगे!",
            browseproducts: "उत्पाद ब्राउज़ करें",
            add: "जोड़ें",

            // Contact
            getintouch: "संपर्क करें",
            contact_desc: "हमारे उत्पादों के बारे में प्रश्न हैं या कस्टम ऑर्डर की आवश्यकता है? हम आपके कार्यक्षेत्र को बेहतर बनाने में आपकी सहायता के लिए यहाँ हैं।",
            phone: "फ़ोन",
            email: "ईमेल",
            visitus: "हमसे मिलें",
            sendmessage: "संदेश भेजें",
            fullname: "पूरा नाम",
            emailaddress: "ईमेल पता",
            message: "संदेश",
            sending: "भेजा जा रहा है...",
            msg_success: "संदेश सफलतापूर्वक भेजा गया! हम जल्द ही आपसे संपर्क करेंगे।",
            msg_error: "संदेश भेजने में विफल। कृपया पुन: प्रयास करें।",

            // Footer
            footer_desc: "प्रीमियम स्टेशनरी के साथ अपने कार्यक्षेत्र को बेहतर बनाएं। हर उत्पाद में गुणवत्ता और सौंदर्य।",
            stayupdated: "अपडेट रहें",
            newsletter_desc: "विशेष ऑफ़र और नए आगमन के लिए सदस्यता लें।",
            join: "जुड़ें",
            allrights: "सर्वाधिकार सुरक्षित।",
            privacypolicy: "गोपनीयता नीति",
            terms: "सेवा की शर्तें",
        }
    };

    const t = (key, params = {}) => {
        let text = translations[language]?.[key] || translations['English']?.[key] || key;
        
        // Replace placeholders like {amount}
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, params[param]);
        });
        
        return text;
    };

    const fetchLanguageSettings = async (email) => {
        try {
            const res = await api.get(`/settings/${email}/`);
            if (res.data.language) {
                setLanguage(res.data.language);
            }
        } catch (err) {
            console.error('Error fetching language settings:', err);
        }
    };

    const updateLanguageSettings = async (email, newLanguage) => {
        try {
            await api.put(`/settings/${email}/`, { language: newLanguage });
        } catch (err) {
            console.error('Error updating language settings:', err);
        }
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            fetchLanguageSettings,
            updateLanguageSettings
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
