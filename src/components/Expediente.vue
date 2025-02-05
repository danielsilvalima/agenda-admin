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
              CADASTRO DE EXPEDIENTE
          </v-card-title>
      </v-card-item>

      <v-card-text>

        <v-row dense>
          <v-col cols="12" md="12">
            <p class="secondary-text text-caption text-center">ESCOLHA O RECURSO DESEJADO ABAIXO</p>
            <v-window v-model="window" show-arrows>
              <v-window-item v-for="(grupo, index) in recursosPaginados" :key="index">
                <v-container>
                  <v-row justify="center" no-gutters >
                    <v-slide-group show-arrows>
                      <v-slide-group-item v-for="recurso in grupo" :key="recurso.id">
                        <v-card
                          class="d-flex flex-column justify-center align-center pa-4 mx-2 text-center mb-2"
                          height="110px" width="100px"
                          elevation="2"
                          :class="{ 'selected': selectedRecurso === recurso }"
                          @click="selecionarRecurso(recurso)"
                        >

                          <v-img
                            :width="50"
                            :height="50"
                            aspect-ratio="16/9"
                            cover style="border-radius: 50%;"
                            :src="recurso.path"
                          ></v-img>
                          <span class="text-caption font-weight-bold" style="white-space: normal; word-wrap: break-word;">
                            {{ recurso.descricao }}
                          </span>
                        </v-card>
                      </v-slide-group-item>
                    </v-slide-group>
                  </v-row>
                </v-container>
              </v-window-item>
            </v-window>
          </v-col>

          <v-col cols="12" md="12">
            <v-select
              density="compact" class="text-caption"
              :items="diasDisponiveis"
              label="DIA DA SEMANA"
              v-model="expediente.horario_expediente_id"
              item-value="id"
              item-title="descricao"
            ></v-select>
          </v-col>

          <v-col cols="6" md="6" >
            <v-text-field density="compact" :rules="[rules.required]" label="HORA ABERTURA" v-maska="'##:##'"
              maxLength="5" v-model="expediente.hora_abertura" type="time"
              @blur="expediente.hora_abertura = formatarHorario(expediente.hora_abertura)"
              id="hora_abertura" name="hora_abertura"></v-text-field>
          </v-col>

          <v-col cols="6" md="6" >
            <v-text-field density="compact" :rules="[rules.required]" label="HORA FECHAMENTO" v-maska="'##:##'"
              maxLength="5" v-model="expediente.hora_fechamento" type="time"
              @blur="expediente.hora_fechamento = formatarHorario(expediente.hora_fechamento)"
              id="hora_fechamento" name="hora_fechamento"></v-text-field>
          </v-col>

          <v-col cols="6" md="6" >
            <v-text-field density="compact" :rules="[rules.required]" label="INÍCIO INTERVALO" v-maska="'##:##'"
              maxLength="5" v-model="expediente.intervalo_inicio" type="time"
              @blur="expediente.intervalo_inicio = formatarHorario(expediente.intervalo_inicio)"
              id="intervalo_inicio" name="intervalo_inicio"></v-text-field>
          </v-col>

          <v-col cols="6" md="6" >
            <v-text-field density="compact" :rules="[rules.required]" label="TÉRMINO INTERVALO" v-maska="'##:##'"
              maxLength="5" v-model="expediente.intervalo_fim" type="time"
              @blur="expediente.intervalo_fim = formatarHorario(expediente.intervalo_fim)"
              id="intervalo_fim" name="intervalo_fim"></v-text-field>
          </v-col>

          <v-col cols="12" md="12">
            <v-btn size="small" block color="secondary" @click="adicionarExpediente" class="text-caption">
              ADICIONAR EXPEDIENTE
            </v-btn>
          </v-col>
        </v-row>

        <!-- Lista de expedientes adicionados -->
        <v-list>
          <v-card
            v-for="(item, index) in listaExpedientes" :key="index"
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
                  class="ml-auto "
                  @click="removerExpediente(index)"
                ></v-btn>
                <strong class="text-caption">{{ getDiaDescricao(item.horario_expediente_id) }}</strong>
              </template>
              <template v-slot:append>
                <div class="d-flex justify-space-between horario-wrapper ">
                  <span class="font-weight-black text-body-2 mt-1 horario text-caption">{{ formataHora(item.hora_abertura) }} /</span>
                  <span class="font-weight-black text-body-2 mt-1 horario text-caption">{{ formataHora(item.intervalo_inicio) }} /</span>
                  <span class="font-weight-black text-body-2 mt-1 horario text-caption">{{ formataHora(item.intervalo_fim) }} /</span>
                  <span class="font-weight-black text-body-2 mt-1 horario text-caption">{{ formataHora(item.hora_fechamento) }} </span>
                </div>
              </template>

            </v-list-item>
          </v-card>
        </v-list>

      </v-card-text>

      <template v-slot:actions >
        <v-btn size="small" block class="text-caption"
          :loading="loading"
          color="primary"
          text="CADASTRAR"
          variant="elevated"
          :disabled="selectedRecurso === null"
          @click="salvarExpediente" >
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
      window: 0,
      loading: false,
      drawer: false,
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
      listaExpedientes: [],
      listaRecursos : [],
      rules: {
        required: value => !!value || 'DEVE SER PREENCHIDO',
      },
      expediente: {
        horario_expediente_id: null,
        hora_abertura: null,
        hora_fechamento: null,
        intervalo_inicio: null,
        intervalo_fim: null,
      },
      diasDaSemana: [],
      diasDisponiveis: [],
      selectedRecurso: null
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
    async carregarExpediente(recurso) {
      if(this.empresa?.id){
        this.$root.setLoadingState(true);

        const credencial = localStorage.getItem("googleUserCredential");
        if (credencial) {

          try {
            const empresa = await this.$store.dispatch(
              "expediente/buscarExpediente",
              {id: this.empresa.id, empresa_recurso_id: recurso.id}
            );

            if (empresa && Object.keys(empresa).length > 0) {

              this.listaExpedientes = empresa.agenda_empresa_expedientes?.map((item) => ({
                id: item.id,
                horario_expediente_id: item.horario_expediente_id,
                hora_abertura: item.hora_abertura,
                hora_fechamento: item.hora_fechamento,
                intervalo_inicio: item.intervalo_inicio,
                intervalo_fim: item.intervalo_fim,
                empresa_recurso_id: item.empresa_recurso_id,
                agenda_empresa_recursos: item.agenda_empresa_recursos

              }));
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
    async carregarDiasSemana() {
      if(this.empresa?.id){
        this.$root.setLoadingState(true);

        const credencial = localStorage.getItem("googleUserCredential");
        if (credencial) {
          try {
            const dias = await this.$store.dispatch(
              "horarioExpediente/buscarHorarioExpediente");
            this.diasDaSemana = dias.map((dia) => ({
              id: dia.id,
              descricao: dia.descricao
            }));

            this.atualizarDiasDisponiveis();
          } catch (error) {
            console.error("ERRO AO CARREGAR DIAS DA SEMANA: ", error);
            this.alertTitle = "ERRO AO CARREGAR DIAS DA SEMANA: " + error;
            this.snackbar = true;
          }finally {
            this.$root.setLoadingState(false);
          }
        }
      }
    },
    adicionarExpediente() {
      if (
        this.expediente.horario_expediente_id !== null &&
        this.expediente.hora_abertura &&
        this.expediente.hora_fechamento &&
        this.expediente.intervalo_inicio &&
        this.expediente.intervalo_fim
      ) {
        this.listaExpedientes.push({
          ...this.expediente,
          agenda_empresa_recursos: {id: this.selectedRecurso.id, descricao: this.selectedRecurso.descricao }});
        this.expediente = {
          horario_expediente_id: null,
          hora_abertura: null,
          hora_fechamento: null,
          intervalo_inicio: null,
          intervalo_fim: null,
        };
        this.atualizarDiasDisponiveis();
      } else {
        this.alertTitle = "POR FAVOR, PREENCHA TODOS OS CAMPOS ANTES DE ADICIONAR";
        this.snackbar = true;
      }
    },
    removerExpediente(index) {
      this.listaExpedientes.splice(index, 1);
      this.atualizarDiasDisponiveis();
    },
    salvarExpediente() {
      this.loading = true;

      if(!this.empresa.id){
        this.alertTitle = 'NECESSÁRIO CADASTRAR A EMPRESA';
        this.snackbar = true;
        this.loading = false;
        return;
      }

      const payload = {
        id: this.empresa.id,
        razao_social: this.empresa.razao_social,
        cnpj: this.empresa.cnpj,
        agenda_empresa_recursos: this.selectedRecurso.id,
        agenda_empresa_expedientes: this.listaExpedientes,
        agenda_user: { id: this.empresa.agenda_user.id, email: this.empresa.agenda_user.email },
      };
      this.$store.dispatch("expediente/salvarExpediente", payload)
        .then(() => {
          this.alertTitle = 'SALVO COM SUCESSO';
          this.snackbar = true;
          this.loading = false;
        })
        .catch(error => {
          console.error("ERRO AO SALVAR O SERVIÇO:", error);
          this.alertTitle = 'ERRO AO SALVAR O SERVIÇO: ' + error;
          this.snackbar = true;
          this.loading = false;
        });
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
    atualizarDiasDisponiveis() {
      const diasJaAdicionados = this.listaExpedientes.map(
        (expediente) => expediente.horario_expediente_id
      );
      this.diasDisponiveis = this.diasDaSemana.filter(
        (dia) => !diasJaAdicionados.includes(dia.id)
      );
    },
    getDiaDescricao(horario_expediente_id) {
      const dia = this.diasDaSemana.find(
        (item) => item.id === horario_expediente_id
      );
      return dia ? dia.descricao : "DIA NÃO ENCONTRADO";
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
    selecionarRecurso(index) {
      this.carregarExpediente(index);
      this.carregarDiasSemana();

      this.selectedRecurso = index;
    }
  },
};
</script>
<script setup>
  import { vMaska } from "maska/vue"
</script>

<style>

.recurso-container {
  overflow-x: auto;
  white-space: nowrap;
  display: flex;
  padding: 10px;
}
.recurso-wrapper {
  display: flex;
  gap: 10px;
}
.recurso-item {
  width: 100px;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #fef5d4;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid transparent;
  padding: 5px;
  text-align: center;
}
.recurso-item.selected {
  border-color: blue;
}
.recurso-imagem {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

</style>
