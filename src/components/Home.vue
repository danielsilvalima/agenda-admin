<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="2">
        <v-text-field
          v-model="dataInicial"
          label="Data Inicial"
          type="date"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="2">
        <v-text-field
          v-model="dataFinal"
          label="Data Final"
          type="date"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="6">
        <v-select
          v-model="recursosSelecionados"
          :items="recursoOptions"
          :loading="loading"
          item-title="title"
          item-value="value"
          label="Profissional"
          chips
          multiple
        ></v-select>
      </v-col>
      <v-col cols="12" md="2">
        <v-btn
          color="primary"
          :disabled="loading"
          :loading="loading"
          @click="filtrarDados"
          >Pesquisar</v-btn
        >
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" sm="3" md="3" v-for="card in cards" :key="card.title">
        <v-card class="pa-4" elevation="3">
          <v-icon :color="card.color" size="20">{{ card.icon }}</v-icon>
          <div class="text-h7 mt-2">{{ card.title }}</div>
          <div class="text-h6 font-weight-bold">{{ card.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-6 align-stretch">
      <v-col cols="12" md="6">
        <v-card class="pa-4 h-100" elevation="3">
          <div class="text-subtitle-1 font-weight-medium mb-2">
            Agendamentos por Serviço
          </div>
          <apexchart
            width="100%"
            type="donut"
            :options="chartOptions"
            :series="serviceData"
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="pa-4 h-100" elevation="3">
          <div class="text-subtitle-1 font-weight-medium mb-2">
            Agendamentos por Dia
          </div>
          <apexchart
            width="100%"
            type="bar"
            :options="barChartOptions"
            :series="dayData"
          />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters } from "vuex";
import { messaging } from "../firebase";
import { getToken } from "firebase/messaging";

export default {
  data() {
    return {
      loading: false,
      dataInicial: new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      dataFinal: new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10),
      recursoOptions: [],
      recursosSelecionados: null,
      cards: [
        {
          title: "Agendamentos",
          value: 0,
          icon: "mdi-calendar-check",
          color: "success",
        },
        {
          title: "Cancelamentos",
          value: 0,
          icon: "mdi-calendar-remove",
          color: "error",
        },
        {
          title: "Serviços Ativos",
          value: 0,
          icon: "mdi-hammer-wrench",
          color: "purple",
        },
        {
          title: "Recursos Ativos",
          value: 0,
          icon: "mdi-account-hard-hat",
          color: "info",
        },
      ],
      serviceData: [],
      chartOptions: {
        labels: [],
        chart: {
          type: "donut",
        },
        legend: { position: "bottom" },
      },
      dayData: [{ name: "Agendamentos", data: [] }],
      barChartOptions: {
        chart: {
          type: "bar",
          toolbar: {
            show: false,
          },
        },
        xaxis: { categories: [], type: "category" },
        colors: ["#1583d4"],
        dataLabels: { enabled: true },
      },
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
  },
  watch: {
    empresa: {
      immediate: true, // Executa ao iniciar o componente
      handler(novaEmpresa) {
        if (novaEmpresa) {
          this.initializeFCM();
        }
      },
    },
  },
  methods: {
    async initializeFCM() {
      try {
        // 1. Solicitar permissão para notificações
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          console.warn("Permissão para notificações foi negada pelo usuário.");
          return;
        }

        const vapidKey = import.meta.env.VITE_APP_VAPID_KEY;
        const currentToken = await getToken(messaging, { vapidKey });

        if (currentToken) {
          //console.log("Token FCM obtido com sucesso:", currentToken);
          this.$store.commit("empresa/setToken", currentToken);
        } else {
          console.warn(
            "Nenhum token FCM disponível. Verifique suas configurações."
          );
          this.$store.commit("empresa/setToken", null);
        }
      } catch (err) {
        console.error("Erro ao inicializar o FCM:", err.message);
        this.$store.commit("empresa/setToken", null);
      }
    },
    async filtrarDados() {
      try {
        this.$store.dispatch("loading/showLoading");
        this.loading = true;
        if (this.empresa) {
          const response = await this.$store.dispatch(
            "dashboard/getDashboard",
            {
              email: this.empresa.agenda_user?.email,
              dataInicial: this.dataInicial,
              dataFinal: this.dataFinal,
              recurso: this.recursosSelecionados,
            }
          );

          // Atualiza os cards
          this.cards[0].value = response.totalAgendamentosAtivos;
          this.cards[1].value = response.totalAgendamentosCancelados;
          this.cards[2].value = response.servicosAtivos;
          this.cards[3].value = response.recursosAtivos;

          // Atualiza gráfico de serviços (Donut)
          const servicoLabels = Object.keys(response.agendamentosPorServico);
          const servicoValores = Object.values(response.agendamentosPorServico);

          this.chartOptions = {
            ...this.chartOptions,
            labels: servicoLabels,
          };
          this.serviceData = servicoValores;

          // Atualiza gráfico de dias (Barra)
          const datasOrdenadas = Object.entries(
            response.agendamentosPorDia
          ).sort(([dataA], [dataB]) => {
            const [diaA, mesA, anoA] = dataA.split("/").map(Number);
            const [diaB, mesB, anoB] = dataB.split("/").map(Number);
            return (
              new Date(anoA, mesA - 1, diaA) - new Date(anoB, mesB - 1, diaB)
            );
          });
          const dias = datasOrdenadas.map(([data]) => data);
          const agendamentos = datasOrdenadas.map(([, valor]) => valor);

          this.barChartOptions = {
            ...this.barChartOptions,
            xaxis: {
              ...this.barChartOptions.xaxis,
              categories: dias,
              type: "category",
            },
          };
          this.dayData = [
            {
              name: "Agendamentos",
              data: agendamentos,
            },
          ];
        }
      } catch (error) {
        console.error(
          "Erro ao carregar dashboard:",
          error.response?.data?.message ||
            `Erro ao carregar dashboard: ${error}`
        );
        this.$store.dispatch("toast/showToast", {
          message:
            error.response?.data?.message ||
            `Erro ao carregar dashboard:  ${error}`,
          color: "error",
        });
      } finally {
        this.$store.dispatch("loading/hideLoading");
        this.loading = false;
      }
    },
    async carregarRecurso() {
      this.loading = true;

      const credencial = localStorage.getItem("googleUserCredential");
      if (credencial) {
        try {
          if (!this.empresa?.id) {
            this.$store.dispatch("toast/showToast", {
              message: `É necessário cadastrar a empresa`,
              color: "warning",
            });
            return;
          }

          const empresa = await this.$store.dispatch(
            "recurso/buscarRecurso",
            this.empresa.id
          );

          if (empresa && Object.keys(empresa).length > 0) {
            this.recursoOptions = empresa.agenda_empresa_recursos.map(
              (recurso) => ({
                title: recurso.descricao,
                value: recurso.id,
              })
            );

            // Preenche os selecionados com todos os IDs retornados
            this.recursosSelecionados = empresa.agenda_empresa_recursos.map(
              (recurso) => recurso.id
            );
          }
        } catch (error) {
          console.error(
            "Erro ao carregar os profissionais: ",
            error.response.data?.message
          );
          this.$store.dispatch("toast/showToast", {
            message:
              error.response?.data?.message ||
              `Erro ao carregar os profissionais:  ${error}`,
            color: "error",
          });
        } finally {
          this.loading = false;
        }
      }
    },
  },
  mounted() {
    this.filtrarDados();
    this.carregarRecurso();
  },
};
</script>
