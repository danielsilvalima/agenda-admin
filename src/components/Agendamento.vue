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
    <SideMenu>

      <v-container class="d-flex justify-center align-start">
        <v-row dense class="justify-center">
          <v-card class="mx-auto my-6" elevation="16" width="600px">
            <v-card-title>AGENDAMENTOS</v-card-title>
            <v-card-text>
              <v-date-input
                v-model="dataSelecionada"
                label="ESCOLHA A DATA"
                prepend-icon=""
                prepend-inner-icon="$calendar"
                variant="solo"
                placeholder="DD/MM/AAAA"
                @update:model-value="buscarAgendamentos"
              ></v-date-input>

              <v-expansion-panels multiple>
                <v-expansion-panel
                  v-for="(agendamentos, data) in agendamentosPorData"
                  :key="data"
                >
                  <v-expansion-panel-title>
                    {{ formatarData(data) }}
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <v-list>
                      <v-list-item-group>
                        <v-list-item
                          v-for="agendamento in agendamentos"
                          :key="agendamento.id"
                        >
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ agendamento.cliente.nome_completo }} - {{ agendamento.servico.descricao }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              HORÁRIO: {{ formatarHora(agendamento.start_scheduling_at) }} -
                              {{ formatarHora(agendamento.end_scheduling_at) }} |
                              VALOR: R$ {{ formatarValorMonetario(agendamento.vlr)  }}
                              <v-chip :color="getStatusColor(agendamento.status)">
                              {{ traduzirStatus(agendamento.status) }}
                            </v-chip>
                            </v-list-item-subtitle>
                          </v-list-item-content>

                          <!-- v-chip exibindo o status com cor dinâmica -->
                          <v-list-item-action>

                          </v-list-item-action>

                        </v-list-item>
                      </v-list-item-group>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-card-text>
          </v-card>
        </v-row>
      </v-container>

    </SideMenu>
  </v-app>


</template>

<script>
import { mapGetters } from "vuex";
import SideMenu from "@/components/SideMenu.vue";
import moment from "moment";
import { VDateInput } from 'vuetify/labs/VDateInput';

export default {
  components: {
    SideMenu,
    VDateInput
  },
  data() {
    return {
      loading: false,
      drawer: false,
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
      dataSelecionada: new Date(),
      agendamentosPorData: [],
    };
  },
  computed: {
    ...mapGetters("empresa",["getEmpresa"]),
    empresa() {
      return this.getEmpresa;
    },
  },
  created() {
    this.carregarEmpresa();
  },
  methods: {
    async carregarEmpresa() {
      this.$root.setLoadingState(true);
      const credencial = localStorage.getItem("googleUserCredential");
      if (credencial) {
        const credencialObj = JSON.parse(credencial);

        try {
          const empresa = await this.$store.dispatch(
            "empresa/buscarEmpresa",
            credencialObj.email
          );

          if (empresa && Object.keys(empresa).length > 0) {
            if(empresa?.expiration){
              this.alertTitle = this.empresa?.message;
              this.snackbar = true;
              return;
            }

            this.buscarAgendamentos();

          }
        } catch (error) {
          console.error("ERRO AO CARREGAR EMPRESA: ", error);
          this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error;
          this.snackbar = true;
        } finally {
          this.$root.setLoadingState(false);
        }
      }
    },
    async buscarAgendamentos() {
      this.$root.setLoadingState(true);
      const credencial = localStorage.getItem("googleUserCredential");
      if (credencial) {
        if(!this.empresa && !this.empresa.id){
          this.alertTitle = "É NECESSÁRIO CADASTRAR A EMPRESA";
          this.snackbar = true;
          return
        }
          //const credencialObj = JSON.parse(credencial);
        let data = this.atualizarData(this.dataSelecionada);

        try {
          const response = await this.$store.dispatch(
            "empresa/buscarAgendamentos",
            {id: this.empresa.id, data: data}
          );
          this.processarAgendamentos(response);
        } catch (error) {
          console.error("ERRO AO CARREGAR EMPRESA: ", error);
          this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error;
          this.snackbar = true;
        } finally {
          this.$root.setLoadingState(false);
        }
      }
    },
    selecionarHorario(horario) {
      this.horarioSelecionado = horario; // Define o horário selecionado
    },
    getStatusColor(status) {
      const colors = {
        A: "green", // Se "A" significa "Ativo" ou "Confirmado"
        C: "red" // Se houver um status "Cancelado"
      };
      return colors[status] || "gray"; // Cor padrão caso não reconheça o status
    },
    traduzirStatus(status) {
      const statusMap = {
        A: "AGENDADO",
        C: "CANCELADO"
      };

      return statusMap[status] || status;
    },
    processarAgendamentos(empresa) {
      const agendamentosAgrupados = {};

      if (empresa && empresa.agenda_clientes) {

        empresa.agenda_clientes.forEach((cliente) => {
          cliente.agenda_cliente_agendamentos.forEach((agendamento) => {
            const dataAgendamento = agendamento.start_scheduling_at.split(" ")[0]; // Pega apenas a data YYYY-MM-DD

            if (!agendamentosAgrupados[dataAgendamento]) {
              agendamentosAgrupados[dataAgendamento] = [];
            }

            agendamentosAgrupados[dataAgendamento].push({
              id: agendamento.id,
              cliente: cliente,
              servico: empresa.agenda_empresa_servicos.find(s => s.id === agendamento.empresa_servico_id) || { descricao: "Serviço não encontrado" },
              start_scheduling_at: agendamento.start_scheduling_at,
              end_scheduling_at: agendamento.end_scheduling_at,
              vlr: agendamento.vlr,
              status: agendamento.status
            });
          });
        });
      }

      // Ordena os agendamentos por horário dentro de cada dia
      for (let data in agendamentosAgrupados) {
        agendamentosAgrupados[data].sort((a, b) => new Date(a.start_scheduling_at) - new Date(b.start_scheduling_at));
      }

      this.agendamentosPorData = agendamentosAgrupados;
      return "";
    },

    formatarData(data) {
      return moment(data).format("DD/MM/YYYY");
    },

    formatarHora(hora) {
      return moment(hora).format("HH:mm");
    },
    formatarValorMonetario(input) {
      if (!input) return "0,00";


      return input.replace(".", ",");
    },
    atualizarData(data) {
      const dateObj = new Date(data);
      const offset = dateObj.getTimezoneOffset() * 60000; // Ajuste de fuso horário
      const localDate = new Date(dateObj - offset).toISOString().slice(0, 10);
      return localDate;
    },
  },
};
</script>

