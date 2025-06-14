import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';




i18n
    .use(Backend) // Sử dụng backend để load translations (ví dụ: từ /locales)
    .use(LanguageDetector) // Tự động phát hiện ngôn ngữ của người dùng
    .use(initReactI18next) // pass i18n instance to react-i18next
    .init({
        fallbackLng: 'vi', // Ngôn ngữ mặc định
        debug: process.env.NODE_ENV === 'development',
        backend: {
            loadPath: '/locales/{{lng}}.json', // Đường dẫn đến file translations
        },
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;