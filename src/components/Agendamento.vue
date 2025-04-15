<template>
  <v-card class="mx-auto my-6" elevation="16">
    <v-card-title class="text-caption">AGENDAMENTOS</v-card-title>
    <v-card-text>
      <v-date-input
        class="text-caption"
        v-model="dataSelecionada"
        label="ESCOLHA A DATA"
        prepend-icon=""
        prepend-inner-icon="$calendar"
        variant="solo"
        placeholder="DD/MM/AAAA"
        hide-actions
        type="button"
        @update:model-value="buscarAgendamentos"
      ></v-date-input>

      <v-expansion-panels multiple>
        <v-expansion-panel
          v-for="(agendamentos, data) in agendamentosPorData"
          :key="data"
        >
          <v-expansion-panel-title class="text-caption">
            {{ formatarData(data) }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list>
              <v-list-item-group>
                <v-list-item
                  v-for="agendamento in agendamentos"
                  :key="agendamento.id"
                  class="px-3 py-2"
                >
                  <v-card class="pa-2 w-100" elevation="2">
                    <v-list-item-content>
                      <v-list-item-title
                        class="text-caption font-weight-bold text-body-1"
                      >
                        {{ agendamento.cliente.nome_completo }} -
                        {{ agendamento.servico.descricao }}
                      </v-list-item-title>

                      <v-list-item-subtitle class="text-caption">
                        HORÁRIO:
                        <strong>{{
                          formatarHora(agendamento.start_scheduling_at)
                        }}</strong>
                        -
                        <strong>{{
                          formatarHora(agendamento.end_scheduling_at)
                        }}</strong>
                        | VALOR:
                        <strong
                          >R$
                          {{ formatarValorMonetario(agendamento.vlr) }}</strong
                        >
                      </v-list-item-subtitle>

                      <!-- Status com `v-chip` ajustado para mobile -->
                      <v-chip
                        :color="getStatusColor(agendamento.status)"
                        class="mt-2"
                        small
                      >
                        {{ traduzirStatus(agendamento.status) }}
                      </v-chip>
                    </v-list-item-content>
                  </v-card>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";
import { VDateInput } from "vuetify/labs/VDateInput";

export default {
  components: {
    VDateInput,
  },
  data() {
    return {
      loading: false,
      dataSelecionada: new Date(),
      agendamentosPorData: {},
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]),
    empresa() {
      return this.getEmpresa;
    },
  },
  watch: {
    empresa: {
      immediate: true,
      handler(novaEmpresa) {
        if (novaEmpresa && novaEmpresa.id) {
          this.buscarAgendamentos();
        }
      },
    },
    /*dataSelecionada() {
      this.buscarAgendamentos();
    }*/
  },
  methods: {
    async buscarAgendamentos() {
      /*const credencial = localStorage.getItem("googleUserCredential");
      if (!credencial) return;*/

      if (!this.empresa || !this.empresa.id) {
        this.$store.dispatch("toast/showToast", {
          message: `É necessário cadastrar a empresa`,
          color: "warning",
        });
        return;
      }

      this.$store.dispatch("loading/showLoading");

      try {
        const data = this.formatarDataParaApi(this.dataSelecionada);
        const response = await this.$store.dispatch(
          "empresa/buscarAgendamentos",
          {
            id: this.empresa.id,
            data: data,
          }
        );

        this.processarAgendamentos(response);
      } catch (error) {
        console.error("Erro ao buscar agendamentos:", error);
        this.$store.dispatch("toast/showToast", {
          message:
            error.response?.data?.message ||
            `Erro ao buscar agendamentos:  ${error}`,
          color: "error",
        });
      } finally {
        this.$store.dispatch("loading/hideLoading");
      }
    },

    processarAgendamentos(empresa) {
      const agendamentosPorData = {};

      if (empresa?.agenda_clientes?.length) {
        empresa.agenda_clientes.forEach((cliente) => {
          cliente.agenda_cliente_agendamentos.forEach((agendamento) => {
            const data = agendamento.start_scheduling_at.split(" ")[0];

            if (!agendamentosPorData[data]) {
              agendamentosPorData[data] = [];
            }

            const servico = empresa.agenda_empresa_servicos.find(
              (s) => s.id === agendamento.empresa_servico_id
            );

            agendamentosPorData[data].push({
              id: agendamento.id,
              cliente,
              servico: servico || { descricao: "Serviço não encontrado" },
              start_scheduling_at: agendamento.start_scheduling_at,
              end_scheduling_at: agendamento.end_scheduling_at,
              vlr: agendamento.vlr,
              status: agendamento.status,
            });
          });
        });

        // Ordena por hora
        Object.keys(agendamentosPorData).forEach((data) => {
          agendamentosPorData[data].sort(
            (a, b) =>
              new Date(a.start_scheduling_at) - new Date(b.start_scheduling_at)
          );
        });
      }

      this.agendamentosPorData = agendamentosPorData;
    },

    getStatusColor(status) {
      const cores = { A: "green", C: "red" };
      return cores[status] || "gray";
    },

    traduzirStatus(status) {
      const statusMap = { A: "AGENDADO", C: "CANCELADO" };
      return statusMap[status] || status;
    },

    formatarData(data) {
      return moment(data).format("DD/MM/YYYY");
    },

    formatarDataParaApi(data) {
      return moment(data).format("YYYY-MM-DD");
    },

    formatarHora(hora) {
      return moment(hora).format("HH:mm");
    },

    formatarValorMonetario(valor) {
      if (typeof valor === "string") valor = parseFloat(valor);
      return valor.toFixed(2).replace(".", ",");
    },
  },
};
</script>
