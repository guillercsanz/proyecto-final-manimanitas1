//import './assets/main.css';
import { createApp } from 'vue';
import { VueFire, VueFireAuth } from 'vuefire';
import App from './App.vue';
import { firebaseApp } from './firebase';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { createVuetify } from "vuetify";
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import "vuetify/styles"; // Importar los estilos de Vuetify
import "@mdi/font/css/materialdesignicons.css";
import { faInstagram, faXTwitter, faFacebook } from '@fortawesome/free-brands-svg-icons';

library.add(faInstagram, faXTwitter, faFacebook);

import i18n from './Idiomas/i18n';

const app = createApp(App);

// Configurar VueFire
app.use(VueFire, {
  firebaseApp,
  modules: [
    VueFireAuth(), // Habilitar autenticación
  ],
});

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
});

app.use(vuetify);
// Montar la aplicación
app.use(i18n)
app.component('font-awesome-icon', FontAwesomeIcon);

app.mount('#app');


