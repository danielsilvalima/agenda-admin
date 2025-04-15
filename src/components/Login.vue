<template>
  <v-snackbar v-model="snackbar" :timeout="timeout">
    {{ alertTitle }}
    <template v-slot:actions>
      <v-btn size="small" color="blue" variant="text" @click="snackbar = false">
        Fechar
      </v-btn>
    </template>
  </v-snackbar>

  <div class="login-screen">
    <div class="login-container">
      <!-- Título e Subtítulo -->
      <h1 class="login-title">Bem-vindo ao seu Painel de Administração</h1>
      <p class="login-subtitle">
        Gerencie seus agendamentos e clientes de forma prática e eficiente
      </p>

      <!-- Botão de Login com o Google -->
      <!--<div v-if="!loggedIn">-->
        <div>
        <div class="google-login-wrapper">
          <GoogleLogin
            :callback="handleLoginCallback"
            prompt
            auto-login
            class="google-login-btn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { decodeCredential } from "vue3-google-login";

export default {
  data() {
    return {
      loggedIn: false,
      user: null,
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
    };
  },
  created() {
    this.checkStoredCredential();
  },
  methods: {
    ...mapActions("empresa", ["loginUsuario"]),

    checkStoredCredential() {
      const storedCredential = localStorage.getItem("googleUserCredential");
      if (storedCredential) {
        const decodedUser = JSON.parse(storedCredential);
        this.user = decodedUser;
        this.loggedIn = true;
        this.loginUser(decodedUser);
      }
    },

    async handleLoginCallback(response) {
      const decodedUser = decodeCredential(response.credential);
      this.user = decodedUser;
      localStorage.setItem("googleUserCredential", JSON.stringify(decodedUser));
      await this.loginUser(decodedUser);
    },

    async loginUser(userCredential) {
      try {
        await this.$store.dispatch("empresa/loginUsuario", JSON.stringify(userCredential));
        this.loggedIn = true;
        this.$router.push("/app/home");
      } catch (error) {
        this.showErrorSnackbar(error);
      }
    },

    showErrorSnackbar(error) {
      console.error("Erro ao realizar login:", error);
      this.alertTitle = `Erro ao realizar login: ${error.message || error}`;
      this.snackbar = true;
    },
  },
};
</script>

<style scoped>
/* Tela de fundo */
.login-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f3f4f6, #e9ecef);
  font-family: "Roboto", sans-serif;
  color: #333;
  padding: 20px;
  text-align: center;
}

/* Container do login */
.login-container {
  max-width: 400px;
  width: 100%;
  background: white;
  padding: 30px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* Título */
.login-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

/* Subtítulo */
.login-subtitle {
  font-size: 16px;
  margin-bottom: 20px;
  color: #7f8c8d;
}

/* Wrapper para o botão */
.google-login-wrapper {
  display: flex;
  width: 100%;
  justify-content: center;
}

/* Botão do Google */
.google-login-btn {
  display: inline-block;
  width: 100%;
  max-width: 269px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  background: none;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.google-login-btn:hover {
  background: #357ae8;
}
</style>
