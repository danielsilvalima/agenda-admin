<template>
  <v-row>
    <v-col cols="12" offset-sm="12" sm="12">
      <v-card >
        <v-card-title class="bg-blue d-flex align-center text-white">
          <span class="text-h5">{{ empresa ? empresa.razao_social : "SUA EMPRESA" }}</span>

          <v-spacer></v-spacer>

          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-menu" variant="text" v-bind="props"></v-btn>
            </template>

            <v-list>
              <v-list-item v-for="(item, i) in menuItems" :key="i" @click="navigateTo(item.route)">
                <v-list-item-title>{{ item.title }}</v-list-item-title>
              </v-list-item>

              <v-divider></v-divider>

              <v-list-item>
                <v-btn size="small" text variant="elevated" block color="primary" @click="logout">SAIR</v-btn>
              </v-list-item>
            </v-list>
          </v-menu>

        </v-card-title>

        <template v-if="$route.path === '/home'">
          <div v-if="empresa === null" class="d-flex justify-center align-center" style="height: 100vh;">
            <v-card elevation="2" class="pa-4 text-center" >
              <p class="mb-4 text-caption">Você ainda não possui uma empresa cadastrada.</p>
              <v-btn size="small" variant="elevated" color="primary" @click="redirectToEmpresa" class="text-caption">
                CADASTRAR EMPRESA
              </v-btn>
            </v-card>
          </div>

          <div v-else class="d-flex justify-center align-center" style="height: 100vh;">
            <p class="text-caption">{{ message }}</p>
          </div>
        </template>

      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import {googleLogout} from 'vue3-google-login';
import router from "@/router";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "SideMenu",
  data() {
    return {
      drawer: false,
      group: null,
      message : '',
      menuItems : [
        { title: 'HOME', route: '/home' },
        { title: 'AGENDAMENTOS', route: '/agendamento' },
        { title: 'EMPRESA', route: '/empresa' },
        { title: 'PROFISSIONAL', route: '/recurso' },
        { title: 'EXPEDIENTE', route: '/expediente' },
        { title: 'SERVIÇO', route: '/servico' }
      ],
    };
  },
  created() {
    const storedCredential = localStorage.getItem("googleUserCredential");
    if (storedCredential) {
      const decodedUser = JSON.parse(storedCredential);
      this.$store.dispatch("empresa/buscarEmpresa", decodedUser.email)
        .then((empresa) => {
          if (!empresa || Object.keys(empresa).length === 0) {
            this.$store.commit("empresa/setEmpresa", null);
          }else{
            if(empresa.message){
              this.message = empresa.message;
            }else{
              this.message = 'BEM-VINDO À SUA DASHBOARD! AQUI VOCÊ PODE ACESSAR SUAS FUNCIONALIDADES.';
            }
          }
        })
        .catch((error) => {
          console.error("ERRO AO CARREGAR EMPRESA:", error);
        });
    } else {
      // Se não houver credenciais, redirecione para login
      this.$router.push("/");
    }
  },
  computed: {
    ...mapGetters("empresa",["getEmpresa"]),
    empresa() {
      return this.getEmpresa;
    },
  },
  watch: {
    group () {
      this.drawer = false;
    },
    },
  methods: {
    ...mapActions("empresa",["saveEmpresa"]),
    navigateTo(route) {
      this.$router.push(route);
    },
    redirectToEmpresa() {
      router.push("/empresa");
    },
    logout(){
      googleLogout()
      localStorage.removeItem("googleUserCredential");
      this.$store.commit("empresa/setUsuario", null);
      router.push("/");
    },
  },
};
</script>

<style scoped>
/* Personalize o estilo conforme necessário */
</style>
