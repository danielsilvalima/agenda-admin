<template>
  <v-card class="mx-auto my-6" elevation="16" max-width="450">
    <v-card-item>
      <v-card-title class="text-center text-caption">
        CADASTRO DE EMPRESA
      </v-card-title>
    </v-card-item>

    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="12">
          <v-text-field
            density="compact"
            :rules="[rules.required]"
            label="RAZÃO SOCIAL"
            maxLength="100"
            v-model="form.razao_social"
            id="razao_social"
            name="razao_social"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field
            density="compact"
            :rules="[rules.required]"
            label="CNPJ/CPF"
            maxLength="20"
            v-model="form.cnpj"
            id="cnpj"
            name="cnpj"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field
            density="compact"
            readonly
            :rules="[rules.required]"
            label="NOME COMPLETO"
            maxLength="100"
            v-model="form.nome_completo"
            id="nome_completo"
            name="nome_completo"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field
            density="compact"
            :rules="[rules.required]"
            label="CELULAR"
            v-maska="'(##) #.####-####'"
            maxLength="16"
            v-model="form.celular"
            id="celular"
            name="celular"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field
            density="compact"
            readonly
            label="E-MAIL"
            maxLength="100"
            v-model="form.email"
            id="email"
            name="email"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field
            density="compact"
            readonly
            label="LINK PARA CLIENTE"
            maxLength="100"
            v-model="form.hash"
            id="hash"
            name="hash"
            append-inner-icon="mdi-content-copy"
            @click:append-inner="copiarTexto"
          ></v-text-field>
        </v-col>

        <v-row no-gutters>
          <v-col cols="12" md="6">
            <v-switch
              readonly="true"
              v-model="form.status"
              :color="form.status ? 'success' : 'error'"
              label="ATIVADO"
              hide-details
            ></v-switch>
          </v-col>

          <v-col cols="12" md="6">
            <v-switch
              readonly="true"
              v-model="form.expiration"
              :color="form.expiration ? 'error' : 'success'"
              label="EXPIRADO"
              hide-details
            ></v-switch>
          </v-col>
        </v-row>

        <v-row align-stretch>
          <v-col cols="12" md="6">
            <v-card :class="{ 'selected-plan': form.plano_recurso === '1' }" class="h-100">
              <v-card-title>BÁSICO</v-card-title>
              <v-card-text>1 PROFISSIONAL.</v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card :class="{ 'selected-plan': form.plano_recurso === '2' }" class="h-100">
              <v-card-title>PROFISSIONAL</v-card-title>
              <v-card-text>2 a 5 PROFISSIONAIS.</v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card :class="{ 'selected-plan': form.plano_recurso === '3' }" class="h-100">
              <v-card-title>PREMIUM</v-card-title>
              <v-card-text>6 a 15 PROFISSIONAIS.</v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card :class="{ 'selected-plan': form.plano_recurso === '4' }" class="h-100">
              <v-card-title>MASTER</v-card-title>
              <v-card-text>MAIS DE 15 PROFISSIONAIS.</v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Mensagem de suporte -->
        <v-alert type="info" class="mt-4">
          PARA ALTERAR O PLANO,
          <a :href="whatsappLink" target="_blank" class="text-white"
            >CLIQUE AQUI E FALE COM O SUPORTE VIA WHATSAPP.</a
          >
        </v-alert>
      </v-row>
    </v-card-text>

    <template v-slot:actions>
      <v-btn
        size="small"
        block
        class="text-caption"
        :loading="loading"
        :disabled="loading"
        color="primary"
        text="CADASTRAR"
        variant="elevated"
        @click="salvarEmpresa"
      >
        SALVAR
      </v-btn>
    </template>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      loading: false,
      form: {
        razao_social: "",
        cnpj: "",
        nome_completo: "",
        celular: "",
        email: "",
        hash: "",
        plano_recurso: "1",
        expiration: "",
        status: "",
      },
      rules: {
        required: (value) => !!value || "DEVE SER PREENCHIDO",
      },
      whatsappLink:
        "https://wa.me/5516982037314?text=Olá!%20Gostaria%20de%20alterar%20meu%20plano.",
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]),
    ...mapGetters("empresa", ["getToken"]),
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
    token() {
      return this.getToken;
    },
  },
  created() {
    //this.carregarEmpresa();
  },
  watch: {
    empresa: {
      immediate: true, // Executa ao iniciar o componente
      handler(novaEmpresa) {
        if (novaEmpresa) {
          this.carregarEmpresa();
        }
      },
    },
  },
  methods: {
    async salvarEmpresa() {
      if (
        this.form.celular === "" ||
        String(this.formataCelular(this.form.celular)).length < 11
      ) {
        this.$store.dispatch("toast/showToast", {
          message: `Celular inválido`,
          color: "warning",
        });
        return;
      }

      if (this.empresa?.expiration) {
        this.alertTitle = this.empresa?.message;
        this.snackbar = true;
        this.$store.dispatch("toast/showToast", {
          message: this.empresa.message,
          color: "warning",
        });
        return;
      }

      this.form.celular = this.formataCelular(this.form.celular);
      this.form.token = this.token;
      this.loading = true;
      try {
        const response = await this.$store.dispatch(
          "empresa/salvarEmpresa",
          this.form
        );

        if (response === null) {
          this.$store.commit("empresa/setEmpresa", null);
        } else {
          this.$store.commit("empresa/setEmpresa", response);
        }
        this.$store.dispatch("toast/showToast", {
          message: `Salvo com sucesso`,
          color: "success",
        });

        //this.$router.push("/app/empresa");

        setTimeout(() => {
          this.$router.push("/app/empresa").then(() => {
            window.location.reload();
          });
        }, 1000);
      } catch (error) {
        console.error("Erro ao salvar empresa: ", error);
        this.$store.dispatch("toast/showToast", {
          message:
            error.response?.data?.message ||
            `Erro ao salvar empresa:  ${error}`,
          color: "error",
        });
      } finally {
        this.loading = false;
      }
    },
    async carregarEmpresa() {
      this.$store.dispatch("loading/showLoading");
      const credencial = localStorage.getItem("googleUserCredential");

      if (credencial) {
        const credencialObj = JSON.parse(credencial);
        this.form.email = credencialObj.email;
        this.form.nome_completo = credencialObj.name;
        try {
          /*const empresa = await this.$store.dispatch(
            "empresa/buscarEmpresa",
            credencialObj.email
          );*/
          const empresa = this.empresa;

          if (empresa && Object.keys(empresa).length > 0) {
            this.form.razao_social = empresa.razao_social;
            this.form.cnpj = empresa.cnpj;
            this.form.hash = empresa?.hash;
            this.form.celular = empresa.agenda_user?.celular;
            this.form.plano_recurso = empresa.plano_recurso;
            this.form.expiration = empresa.expiration;
            if (empresa.status === "A") {
              this.form.status = true;
            } else if (empresa.status === "D") {
              this.form.status = false;
            }
          }
        } catch (error) {
          console.error("Erro ao carregar empresa: ", error);
          this.$store.dispatch("toast/showToast", {
            message: `Erro ao carregar empresa:  ${error}`,
            color: "error",
          });
          this.snackbar = true;
        } finally {
          this.$store.dispatch("loading/hideLoading");
        }
      }
    },
    formataCelular(celular) {
      return celular
        .replace(" ", "")
        .replace("-", "")
        .replace(".", "")
        .replace(/"/g, "")
        .replace(/'/g, "")
        .replace(/\(|\)/g, "");
    },
    copiarTexto() {
      // Seleciona o texto do campo
      const input = document.getElementById("hash");
      if (input) {
        input.select();
        input.setSelectionRange(0, 99999); // Para compatibilidade com dispositivos móveis

        // Copia para a área de transferência
        navigator.clipboard
          .writeText(input.value)
          .then(() => {
            this.$emit("copiado"); // Emite um evento, se necessário
            this.alertTitle = "LINK COPIADO PARA A ÁREA DE TRANSFERÊNCIA!";
            this.snackbar = true;
            this.$store.dispatch("toast/showToast", {
              message: `Link copiado para área de transferência`,
              color: "info",
            });
          })
          .catch(() => {
            this.alertTitle = "ERRO AO COPIAR O LINK";
            this.snackbar = true;
            this.$store.dispatch("toast/showToast", {
              message: "Erro ao copiar o link",
              color: "error",
            });
          });
      }
    },
  },
};
</script>

<script setup>
import { vMaska } from "maska/vue";
</script>
<style>
.selected-plan {
  border: 2px solid #1976d2; /* Azul do Vuetify */
  background-color: #e3f2fd;
}
</style>
