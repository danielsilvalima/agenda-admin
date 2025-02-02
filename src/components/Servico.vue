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
              CADASTRO DE SERVIÇO
          </v-card-title>
      </v-card-item>

      <v-card-text>

        <v-row dense>

          <v-col cols="12" md="12">
            <p class="secondary-text text-caption text-center">ESCOLHA O RECURSO DESEJADO ABAIXO</p>
            <v-window v-model="window" show-arrows>
              <v-window-item v-for="(grupo, index) in recursosPaginados" :key="index">
                <v-container>
                  <v-row justify="center">
                    <v-col v-for="recurso in grupo" :key="recurso.id" cols="12" sm="4" md="2">
                      <v-card
                        class="d-flex flex-column justify-center align-center pa-4 mx-2 text-center"
                        height="100px" width="140px"
                        elevation="2"
                        :class="{ 'selected': selectedRecurso === recurso }"
                        @click="selecionarRecurso(recurso)"
                      >
                        <v-img
                          :width="80"
                          aspect-ratio="16/9"
                          cover style="border-radius: 50%;"
                          :src="recurso.path">
                        </v-img>
                        <span class="text-caption font-weight-bold" style="white-space: normal; word-wrap: break-word;">
                          {{ recurso.descricao }}
                        </span>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-container>
              </v-window-item>
            </v-window>
          </v-col>

          <v-col cols="12" md="12">
            <v-text-field density="compact"
              v-model="service.descricao"
              label="DESCRIÇÂO DO SERVIÇO"
              :rules="[rules.required]"
              placeholder="EX: CORTE MASCULINO, UNHA MAO, ALUGUEL QUADRA"
              dense
            ></v-text-field>
          </v-col>

          <v-col cols="6" md="6" >
            <v-text-field density="compact" :rules="[rules.required]" label="VALOR"
              maxLength="7" v-model="service.vlr"
              prefix="R$"
              type="decimal"
              @blur="service.vlr = formatarValorMonetario(service.vlr)"
              id="vlr" name="vlr">
            </v-text-field>
          </v-col>

          <v-col cols="6" md="6">
            <v-text-field
              density="compact"
              :rules="[rules.required]"
              label="DURAÇÃO (HH:MM)"
              v-maska="'##:##'"
              type="time"
              maxLength="5"
              v-model="service.duracao"
              @blur="service.duracao = formatarHorario(service.duracao)"
              id="duracao"
              name="duracao">
            </v-text-field>
          </v-col>

          <v-col cols="12" md="12" class="d-flex justify-end">
            <v-btn size="small" color="secondary" @click="adicionarServico" class="text-caption" >
              ADICIONAR SERVIÇO
            </v-btn>
          </v-col>
        </v-row>

        <v-list>
          <template v-if="listaServicos.length === 0">
            <v-card class="mb-4">
              <v-list-item
                color="grey lighten-2"
                rounded="xl"
                class="d-flex justify-space-between align-center"
              >
                <template v-slot:prepend>
                  <strong class="text-caption">NENHUM SERVIÇO CADASTRADO</strong>
                </template>
              </v-list-item>
            </v-card>
          </template>
          <template v-else>
            <v-card
              v-for="(item, index) in listaServicos" :key="index"
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
                    @click="removerServico(index)"
                  ></v-btn>
                  <strong>{{ item.descricao }} - {{ item.agenda_empresa_recursos?.descricao || 'SEM RECURSO' }}</strong>
                </template>
                <template v-slot:append>
                  <div class="d-flex justify-space-between horario-wrapper ">
                    <span class="font-weight-black text-body-2 mt-1 horario text-caption">R$ {{ parseFloat(item.vlr).toFixed(2).replace('.', ',') }} /</span>
                    <span class="font-weight-black text-body-2 mt-1 horario text-caption">{{ formataHora(item.duracao) }}</span>
                  </div>
                </template>

              </v-list-item>
            </v-card>
          </template>
        </v-list>

      </v-card-text>

      <template v-slot:actions >
        <v-btn size="small" block class="text-caption"
          :loading="loading"
          color="primary"
          text="CADASTRAR"
          variant="elevated"
          @click="salvarServicos" >
          SALVAR
        </v-btn>
      </template>

  </v-card>

</template>

<script>
import { mapGetters } from "vuex";
import SideMenu from "@/components/SideMenu.vue";

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
      listaServicos : [],
      listaRecursos : [],
      rules: {
        required: value => !!value || 'DEVE SER PREENCHIDO',
      },
      service:{
        id: null,
        duracao: null,
        vlr: null,
      },
      selectedRecurso: null,
      window: 0
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]),
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
    recursosPaginados() {
      if (!this.listaRecursos || this.listaRecursos.length === 0) return [];

      const itemsPerPage = 5; // Altere conforme necessário
      const paginas = [];

      for (let i = 0; i < this.listaRecursos.length; i += itemsPerPage) {
        paginas.push(this.listaRecursos.slice(i, i + itemsPerPage));
      }

      return paginas;
    }
  },
  created() {
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
  methods: {
    async carregarServico(recurso) {
      if(this.empresa?.id){
        this.$root.setLoadingState(true);

        const credencial = localStorage.getItem("googleUserCredential");
        if (credencial) {

          try {
            const empresa = await this.$store.dispatch(
              "servico/buscarServico",
              {id: this.empresa.id, empresa_recurso_id: recurso.id}
            );

            if (empresa && Object.keys(empresa).length > 0) {

              this.listaServicos = empresa.agenda_empresa_servicos?.map((item) => ({
                id: item.id,
                duracao: item.duracao,
                vlr: item.vlr,
                descricao: item.descricao,
                agenda_empresa_recursos:
                   { descricao: item.agenda_empresa_recursos.descricao,
                    id: item.agenda_empresa_recursos.id,
                    empresa_recurso_id: item.empresa_recurso_id
                  }
              })) || [];
            }
          } catch (error) {
            console.error("ERRO AO CARREGAR EMPRESA: ", error);
            this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error;
            this.snackbar = true;
          } finally {
            this.$root.setLoadingState(false);
          }
        }
      }
    },
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
                path: `${import.meta.env.VITE_APP}/storage/${item.path}`
              }));
            }
          } catch (error) {
            console.error("ERRO AO CARREGAR EMPRESA: ", error.response.data.message);
            this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error.response.data.message;
            this.snackbar = true;
          } finally {
            this.$root.setLoadingState(false);
          }
        }
      }
    },
    adicionarServico() {
      if (!this.service.descricao || !this.service.vlr || !this.service.duracao) {
        this.alertTitle = "POR FAVOR, PREENCHA TODOS OS CAMPOS ANTES DE ADICIONAR";
        this.snackbar = true;
        return;
      }else if(this.selectedRecurso === null){
        this.alertTitle = "POR FAVOR, SELECIONE UM DOS RECURSOS DISPONÍVEIS";
        this.snackbar = true;
        return;
      } else {
        const duplicado = this.listaServicos.find(
          (servico) => servico.descricao === this.service.descricao
        );
        if (duplicado) {
          this.alertTitle = "ESTE SERVIÇO JÁ FOI ADICIONADO";
          this.snackbar = true;
          return;
        }

        //this.service.vlr = parseFloat(this.service.vlr.replace(',', '.')).toFixed(2);

        this.listaServicos.push({
          ...this.service,
          agenda_empresa_recursos: {id: this.selectedRecurso.id, descricao: this.selectedRecurso.descricao
        }});

        this.service = {
          descricao: null,
          vlr: null,
          duracao: null,
        };
      }
    },
    removerServico(index) {
      this.listaServicos.splice(index, 1);
    },
    salvarServicos() {
      this.loading = true;

      if(!this.empresa.id){
        this.alertTitle = 'NECESSÁRIO CADASTRAR A EMPRESA';
        this.snackbar = true;
        this.loading = false;
        return;
      }

      this.empresa.agenda_empresa_servicos = this.listaServicos;
      this.listaServicos = this.listaServicos.map(servico => ({
        ...servico,
        vlr: servico.vlr.replace(',', '.'),
      }));
      const payload = {
        id: this.empresa.id,
        razao_social: this.empresa.razao_social,
        cnpj: this.empresa.cnpj,
        agenda_empresa_recursos: this.selectedRecurso.id,
        agenda_empresa_servicos: this.listaServicos,
        agenda_user: { id: this.empresa.agenda_user.id, email: this.empresa.agenda_user.email },
      };
      this.$store.dispatch("servico/salvarServico", payload)
        .then(() => {
          this.alertTitle = 'SALVO COM SUCESSO';
          this.snackbar = true;
          this.loading = false;
        })
        .catch(error => {
          console.error("ERRO AO SALVAR O SERVIÇO:", error.response.data.message);
          this.alertTitle = 'ERRO AO SALVAR O SERVIÇO: ' + error.response.data.message;
          this.snackbar = true;
          this.loading = false;
        });
    },
    formatarHorario(input) {
      if (!input) return "";

      // Converte para string e remove caracteres não numéricos
      const digits = input.toString().replace(/\D/g, "");

      // Verifica o comprimento do valor e formata adequadamente
      switch (digits.length) {
        case 1:
          return `0${digits}:00`; // Ex.: 1 -> 01:00
        case 2:
          return `${digits}:00`; // Ex.: 11 -> 11:00
        case 3:
          return `${digits.slice(0, 2)}:${digits.slice(2, 3)}0`; // Ex.: 111 -> 11:10
        case 4:
          return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`; // Ex.: 1111 -> 11:11
        default:
          return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`; // Ignora dígitos extras
      }
    },
    formataHora(hora) {
      if (!hora) return "";
      const [hour, minute] = hora.split(":");
      return `${hour}:${minute}`;
    },
    formatarValorMonetario(input) {
      if (!input) return "0,00";

      // Remove caracteres não numéricos, exceto vírgula
      input = input.replace(/[^0-9,]/g, "");

      // Verificar se já contém uma vírgula
      if (input.includes(",")) {
        let [reais, centavos = ""] = input.split(",");

        // Ajustar centavos para exatamente 2 dígitos
        if (centavos.length === 0) {
          centavos = "00";
        } else if (centavos.length === 1) {
          centavos = `${centavos}0`;
        } else if (centavos.length > 2) {
          centavos = centavos.slice(0, 2);
        }

        return `${reais},${centavos}`;
      }

      // Se não contém vírgula, adiciona ",00" no final
      return `${input},00`;
    },
    selecionarRecurso(index) {
      this.carregarServico(index);
      this.selectedRecurso = index;
    },
  },
};
</script>
<script setup>
  import { vMaska } from "maska/vue"
</script>

<style>

.selected {
  border: 2px solid #1976d2; /* Cor azul do Vuetify */
  background-color: rgba(25, 118, 210, 0.2); /* Leve realce no fundo */
  transition: all 0.3s ease-in-out;
}
</style>
