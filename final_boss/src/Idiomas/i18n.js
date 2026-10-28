import { createI18n } from 'vue-i18n';
import enMessages from '@/Idiomas/en.json';
import esMessages from '@/Idiomas/es.json';

// Configuración de vue-i18n
const i18n = createI18n({
   legacy: false,
   locale: 'es',
  messages: {
    en: enMessages,
    es: esMessages,
  },
  numberFormats: {
    es: {
      currency: {
        style: 'currency',
        currency: 'EUR'
      },
    },
    en: {
      currency: {
        style: 'currency',
        currency: 'GBP'
      },
    },
  },
});

export default i18n;