<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12" md="3" v-for="card in cards" :key="card.title">
        <v-card class="pa-4" elevation="3">
          <v-icon color="primary" size="36">{{ card.icon }}</v-icon>
          <div class="text-h6 mt-2">{{ card.title }}</div>
          <div class="text-h5 font-weight-bold">{{ card.value }}</div>
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

<script setup>
import { ref, onMounted } from "vue";
import ApexChart from "vue3-apexcharts";

const cards = ref([
  { title: "Total de Agendamentos", value: 0, icon: "mdi-calendar-check" },
  { title: "Clientes Ativos", value: 0, icon: "mdi-account-group" },
  { title: "Serviços Ativos", value: 0, icon: "mdi-hammer-wrench" },
  { title: "Recursos Ativos", value: 0, icon: "mdi-account-hard-hat" },
]);

const serviceData = ref([]);
const chartOptions = ref({
  labels: [],
  chart: { type: "donut" },
  legend: { position: "bottom" },
});

const dayData = ref([{ name: "Agendamentos", data: [] }]);
const barChartOptions = ref({
  chart: { type: "bar" },
  xaxis: { categories: [] },
  colors: ["#1583d4"],
  dataLabels: { enabled: true },
});

onMounted(async () => {
  try {
    const response = await fetch("/api/dashboard");
    const data = await response.json();

    cards.value[0].value = data.totalAgendamentos;
    cards.value[1].value = data.clientesAtivos;
    cards.value[2].value = data.servicosAtivos;
    cards.value[3].value = data.recursosAtivos;

    chartOptions.value.labels = Object.keys(data.agendamentosPorServico);
    serviceData.value = Object.values(data.agendamentosPorServico);

    barChartOptions.value.xaxis.categories = Object.keys(data.agendamentosPorDia);
    dayData.value[0].data = Object.values(data.agendamentosPorDia);
  } catch (err) {
    console.error("Erro ao carregar dashboard:", err);
  }
});
</script>
