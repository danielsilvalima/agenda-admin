<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="timeout"
  >
  {{ alertTitle }}

    <template v-slot:actions>
      <v-btn
        color="blue"
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
  <v-app>
    <SideMenu
    />
    </v-app>
  <!--<v-card>
    <v-layout>
      <v-app-bar
        color="primary"
        prominent
      >
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>
          {{ empresa ? empresa.razao_social : "SUA EMPRESA" }}
        </v-toolbar-title>
        <v-spacer></v-spacer>

      </v-app-bar>

      <!-- Menu lateral -->
   <!--   <v-navigation-drawer
        v-model="drawer" temporary>
        <v-list>
        <v-list-item @click="navigateTo('/empresa')">Empresa</v-list-item>
        <v-list-item @click="navigateTo('/perfil')">Perfil</v-list-item>
        </v-list>

        <div v-if="loggedIn">
          <v-btn variant="elevated" color="primary"  @click="logout" >
            SAIR
          </v-btn>
        </div>
      </v-navigation-drawer>

      <!-- Conteúdo principal -->
 <!--     <v-main class="fill-height">
        <v-container class="d-flex align-center justify-center" style="min-height: 100vh;">
          <div v-if="empresa === null">
            <v-card elevation="2" class="pa-4 text-center">
              <p class="mb-4">Você ainda não possui uma empresa cadastrada.</p>
              <v-btn variant="elevated" color="primary"  @click="redirectToEmpresa" >
                CADASTRAR EMPRESA
              </v-btn>
            </v-card>
          </div>

          <div v-else>
            <p>Bem-vindo à sua dashboard! Aqui você pode acessar suas funcionalidades.</p>
          </div>
        </v-container>
      </v-main>
    </v-layout>
  </v-card>-->

</template>

<script>
import { mapGetters } from "vuex";
//import SideMenu from "@/components/SideMenu.vue";
import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";

export default {
  components: {
    SideMenu: () => import('@/components/SideMenu.vue'),
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
  created() {
    this.$root.setLoadingState(true);
    let credencial = localStorage.getItem("googleUserCredential");

    if (credencial) {
      let credencialObj = JSON.parse(credencial);

      this.$store.dispatch("empresa/buscarEmpresa", credencialObj.email).catch((error) => {
        console.error("ERRO AO BUSCAR EMPRESA: ", error);
        this.alertTitle = "ERRO AO BUSCAR EMPRESA: " + error;
        this.snackbar = true;
      }).finally(() => {
        this.$root.setLoadingState(false);
      });
    }
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
    this.initializeFCM();
  }
};
</script>
