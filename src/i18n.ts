import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector"

const backendOptions = {
    loadPath: '/ml-with-bricks/locales/{{lng}}.json',
};

i18next.use(HttpApi).use(LanguageDetector).use(initReactI18next).init({
    debug: true,
    load: 'languageOnly',
    fallbackLng: "en",
    backend: backendOptions,
    supportedLngs: ["en", "de"],
    nonExplicitSupportedLngs: true,
    detection: {
        caches: ['localStorage']
    }
});

export default i18next;