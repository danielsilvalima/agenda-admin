<template>
  <v-app>
    <v-snackbar
      v-model="$store.state.toast.toast.show"
      :color="$store.state.toast.toast.color"
    >
      {{ $store.state.toast.toast.message }}
    </v-snackbar>

    <v-overlay
      :model-value="$store.state.loading.loading"
      class="d-flex justify-center align-center"
    >
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>
    <router-view />
  </v-app>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

onMounted(() => {
  router.beforeEach((to, from, next) => {
    const credencial = localStorage.getItem("googleUserCredential");

    if (to.meta.requiresAuth && !credencial) {
      next("/");
    } else if (!to.meta.requiresAuth && credencial && to.path === "/") {
      // Se já está autenticado e tenta acessar a tela de login
      next("/app/home");
    } else {
      next();
    }
  });
});
</script>
