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
  <SideMenu />

    <v-card class="mx-auto my-6"
      elevation="16"
      >

      <v-card-item>
          <v-card-title class="text-center text-caption">
              CADASTRO DE PROFISSIONAL
          </v-card-title>
      </v-card-item>

      <v-card-text>

        <v-row dense class="align-center">
          <v-col cols="9" md="9">
            <v-text-field
              density="compact"
              v-model="resource.descricao"
              label="DESCRIÇÃO DO PROFISSIONAL"
              :rules="[rules.required]"
              placeholder="EX: PROFISSIONAL 1, PROFISSIONAL 2, QUADRA SINTÉTICA 01"
              dense
            ></v-text-field>
          </v-col>

          <v-col cols="3" md="3" class="d-flex align-center">
            <v-btn
              color="secondary"
              @click="adicionarRecurso"
              class="text-caption mb-6"
            >
              ADICIONAR
            </v-btn>
          </v-col>
        </v-row>

        <!-- Upload de Imagem -->
        <v-row>
          <v-col cols="6">
            <v-file-input
              ref="fileInput"
              label="IMAGEM DO PROFISSIONAL"
              accept="image/png, image/jpeg"
              @change="handleFileUpload"
              show-size
              prepend-icon="mdi-camera"
              :rules="[rules.imageSize]"
            ></v-file-input>
          </v-col>

          <v-col cols="6" v-if="previewImage">
            <v-img
              :src="previewImage"
              max-height="100"
              class="mx-auto"
              contain
            ></v-img>
          </v-col>
        </v-row>

        <v-list>
          <template v-if="listaRecursos.length === 0">
            <v-card class="mb-4">
              <v-list-item
                color="grey lighten-2"
                rounded="xl"
                class="d-flex justify-space-between align-center"
              >
                <template v-slot:prepend>
                  <strong class="text-caption">NENHUM PROFISSIONAL CADASTRADO</strong>
                </template>
              </v-list-item>
            </v-card>
          </template>
          <template v-else>
            <v-card
              v-for="(item, index) in listaRecursos" :key="index"
              class="mb-4"
            >
              <v-list-item
                color="primary"
                rounded="xl"
                class="d-flex justify-space-between align-center"
              >
                <template v-slot:prepend>
                  <v-btn size="small"
                    icon="mdi-delete"
                    variant="text" color="red"
                    class="ml-auto text-caption"
                    @click="removerRecurso(index)"
                  ></v-btn>
                  <strong>{{ item.descricao }}</strong>
                </template>

              </v-list-item>
            </v-card>
          </template>
        </v-list>

      </v-card-text>

      <template v-slot:actions >
        <v-btn size="small" block class="text-caption"
          :loading="loading"
          :disabled="validaPlanoRecurso()"
          color="primary"
          text="CADASTRAR"
          variant="elevated"
          @click="salvarRecursos" >
          SALVAR
        </v-btn>
      </template>

  </v-card>

</template>

<script>
import { mapGetters } from "vuex";
import SideMenu from "@/components/SideMenu.vue";
import { validaPlanoRecurso } from '@/utils/planoRecursoUtils';

export default {
  components: {
    SideMenu,
  },
  data() {
    return {
      loading: false,
      drawer: false,
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
      listaRecursos : [],
      resource: {
        id: null,
        decricao: null,
        path: null,
        imagem: null
      },
      previewImage: null,
      rules: {
        required: value => !!value || 'DEVE SER PREENCHIDO',
        imageSize: (file) =>
          !file || file.size <= 5 * 1024 * 1024 || "A imagem deve ter no máximo 5MB",
      },
    };
  },
  computed: {
    ...mapGetters("empresa",["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    ...mapGetters("recurso", ["getRecurso"]),
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
    recurso() {
      return this.getRecurso;
    },
  },
  watch: {
    empresa: {
      immediate: true, // Executa ao iniciar o componente
      handler(novaEmpresa) {
        if (novaEmpresa) {
          this.carregarRecurso();
        }
      }
    }
  },
  created() {
    this.listaRecursos = [];
    this.carregarRecurso();
  },
  methods: {
    async carregarRecurso() {
      if(this.empresa?.id){
        this.$root.setLoadingState(true);
        const credencial = localStorage.getItem("googleUserCredential");
        if (credencial) {

          try {
            const empresa = await this.$store.dispatch(
              "recurso/buscarRecurso",
              this.empresa.id
            );

            if (empresa && Object.keys(empresa).length > 0) {

              this.listaRecursos = empresa.agenda_empresa_recursos?.map((item) => ({
                id:item.id,
                descricao: item.descricao,
                path: item.path
              }));
            }
          } catch (error) {
            console.error("ERRO AO CARREGAR EMPRESA: ", error.response.data?.message);
            this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error.response.data?.message;
            this.snackbar = true;
          } finally {
            this.$root.setLoadingState(false);
          }
        }
      }
    },
    adicionarRecurso() {
      if (!this.resource.descricao) {
        this.alertTitle = "POR FAVOR, PREENCHA TODOS OS CAMPOS ANTES DE ADICIONAR";
        this.snackbar = true;
      } else {
        const duplicado = this.listaRecursos.find(
          (recurso) => recurso.descricao === this.resource.descricao
        );
        if (duplicado) {
          this.alertTitle = "ESTE PROFISSIONAL JÁ FOI ADICIONADO";
          this.snackbar = true;
          return;
        }

        this.listaRecursos.push({ ...this.resource });
        this.resource = {
          descricao: null,
          path: null
        };
        this.previewImage = null;
        this.$refs.fileInput.reset();
      }
    },
    removerRecurso(index) {
      this.listaRecursos.splice(index, 1);
    },
    salvarRecursos() {
      this.loading = true;

      if(!this.empresa){
        this.alertTitle = 'NECESSÁRIO CADASTRAR A EMPRESA';
        this.snackbar = true;
        this.loading = false;
        return;
      }

      const formData = new FormData();

      // Adiciona os dados da empresa
      formData.append("razao_social", this.empresa.razao_social);
      formData.append("cnpj", this.empresa.cnpj);

      formData.append("agenda_user", JSON.stringify({
        id: this.empresa.agenda_user.id,
        email: this.empresa.agenda_user.email
      }));

      this.listaRecursos.forEach((recurso, index) => {
        formData.append(`agenda_empresa_recursos[${index}][id]`, recurso.id || '');
        formData.append(`agenda_empresa_recursos[${index}][descricao]`, recurso.descricao);
        formData.append(`agenda_empresa_recursos[${index}][path]`, recurso.path || '');

        if (recurso.imagem && recurso.imagem instanceof File) {
          formData.append(`agenda_empresa_recursos[${index}][imagem]`, recurso.imagem);
        }
      });
      this.$store.dispatch("recurso/salvarRecurso", formData)
        .then(() => {
          this.alertTitle = 'SALVO COM SUCESSO';
          this.snackbar = true;
          this.loading = false;

          this.carregarRecurso();
        })
        .catch(error => {
          console.error("ERRO AO SALVAR O PROFISSIONAL:", error.response?.data.message);
          this.alertTitle = 'ERRO AO SALVAR O PROFISSIONAL: ' + error.response?.data.message;
          this.snackbar = true;
          this.loading = false;
        });
    },
    validaPlanoRecurso(){
      if(this.empresa && this.listaRecursos){
          return validaPlanoRecurso(this.empresa?.plano_recurso, this.listaRecursos);
      }else{
        return true;
      }
    },
    handleFileUpload(event) {
      const file = event.target.files[0];

      if (!file) return;

      // Verifica o tipo do arquivo
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        this.alertTitle = 'APENAS IMAGENS JPG E PNG SÃO PERMITIDAS';
        this.snackbar = true;
        return;
      }

      // Verifica o tamanho do arquivo (máx. 4MB)
      if (file.size > 4 * 1024 * 1024) {
        this.alertTitle = 'A IMAGEM DEVE TER NO mÁXIMO 4MB';
        this.snackbar = true;
        return;
      }

      // Salva o arquivo para envio
      this.resource.imagem = file;

      // Gera a pré-visualização
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewImage = e.target.result;
      };
      reader.readAsDataURL(file);
    },
  },
};
</script>
