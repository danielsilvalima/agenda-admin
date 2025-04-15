<template>
  <v-app>
    <Sidebar ref="sidebarRef" />

    <v-app-bar app>
      <v-btn icon @click="toggleSidebar">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <v-toolbar-title></v-toolbar-title>
      <v-menu open-on-click offset-y>
        <template v-slot:activator="{ props }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn icon v-bind="props" v-on="on">
                <v-avatar color="primary">
                  <span class="white--text text-h6">{{ userInitial }}</span>
                </v-avatar>
              </v-btn>
            </template>
            <span>{{ userName }} ({{ userEmail }})</span>
          </v-tooltip>
        </template>

        <v-card width="200">
          <v-card-text class="text-center">
            <!--<strong>{{ userEmail }}</strong>-->
            <p>
              Olá, <strong>{{ userName }}</strong>
            </p>
          </v-card-text>
          <v-divider></v-divider>
          <v-list>
            <v-list-item @click="goToProfile">
              <v-list-item-title>Perfil</v-list-item-title>
            </v-list-item>
            <v-list-item @click="logout">
              <v-list-item-content class="d-flex align-center">
                <v-list-item-icon>
                  <v-icon>mdi-logout</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="ml-2">Sair</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import Sidebar from "@/components/Sidebar.vue";
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import {googleLogout} from 'vue3-google-login';
import { useStore } from "vuex";

export default {
  components: {
    Sidebar,
  },
  setup() {
    const store = useStore();
    const router = useRouter();
    const userName = ref("Usuário");
    const userEmail = ref("");
    const userInitial = ref("U");

    onMounted(() => {
      const credencial = JSON.parse(localStorage.getItem("googleUserCredential"));

      if (credencial) {
        userName.value = credencial.name || credencial.email;
        userEmail.value = credencial.email || "";
        userInitial.value = userName.value.charAt(0).toUpperCase();
      }else{
        router.push("/");
      }
    });

    const goToProfile = () => {
      //const usuario = JSON.parse(localStorage.getItem("googleUserCredential"));
      router.push(`/app/empresa`);
      /*router.push({
        name: "cadastroUsuario",
        params: { id: usuario.email },
        state: { usuarioSelecionado: usuario.email },
      });*/
    };

    const logout = () => {
      googleLogout();
      localStorage.removeItem("googleUserCredential");
      store.commit("empresa/setEmpresa", null);
      router.push("/");
    };

    return { logout, userName, userEmail, userInitial, goToProfile };
  },
  methods: {
    toggleSidebar() {
      this.$refs.sidebarRef.toggleDrawer();
    },
  },
};
</script>
<style scoped>
.v-avatar {
  width: 40px;
  height: 40px;
}
</style>
