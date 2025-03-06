<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="timeout"
  >
  {{ alertTitle }}

    <template v-slot:actions>
      <v-btn size="small"
        color="blue"
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>

    <SideMenu
    />

</template>

<script>
import { mapGetters } from "vuex";
import SideMenu from "@/components/SideMenu.vue";
import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";

export default {
  components: {
    SideMenu,
  },
  data() {
    return {
      drawer: false,
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
    };
  },
  computed: {
    ...mapGetters("empresa",["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
  },
  watch: {
    empresa: {
      immediate: true, // Executa ao iniciar o componente
      handler(novaEmpresa) {
        if (novaEmpresa) {
          this.initializeFCM();
        }
      }
    }
  },
  created() {

  },
  methods: {
    async initializeFCM() {
      try {
        // 1. Solicitar permissão para notificações
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Permissão para notificações foi negada pelo usuário.");
          return;
        }

        const vapidKey =
          import.meta.env.VITE_APP_VAPID_KEY;
        const currentToken = await getToken(messaging, { vapidKey });

        if (currentToken) {
          //console.log("Token FCM obtido com sucesso:", currentToken);
          this.$store.commit("empresa/setToken", currentToken);
        } else {
          console.warn("Nenhum token FCM disponível. Verifique suas configurações.");
          this.$store.commit("empresa/setToken", null);
        }

      } catch (err) {
        console.error("Erro ao inicializar o FCM:", err.message);
        this.$store.commit("empresa/setToken", null);
      }
    },
  },
  mounted() {
    //this.initializeFCM();
  }
};
</script>
