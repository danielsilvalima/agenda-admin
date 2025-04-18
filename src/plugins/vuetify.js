/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";
import { pt } from "vuetify/locale";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  locale: {
    locale: "pt", // Define o idioma padrão para 'pt-BR'
    messages: { pt },
  },
  defaults: {
    VTextField: {
      variant: "outlined",
      density: "compact",
    },
    VSelect: {
      variant: "outlined",
      density: "compact",
    },
    VAutocomplete: {
      variant: "outlined",
      density: "compact",
    },
  },
  theme: {
    //defaultTheme: 'dark',
    defaultTheme: "light",
    /*themes: {
      light: {
        dark: false, // Define se é um tema escuro (false para claro)
        colors: {
          primary: '#1976D2', // Azul padrão
          secondary: '#424242', // Cinza
          accent: '#82B1FF', // Azul claro
          error: '#FF5252', // Vermelho
          info: '#2196F3', // Azul
          success: '#4CAF50', // Verde
          warning: '#FFC107', // Amarelo
        },
      },
    }*/
  },
});
