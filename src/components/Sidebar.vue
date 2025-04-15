<template>
  <v-navigation-drawer color="black" v-model="drawer" app width="200">
    <v-list>
      <!--<v-list-item @click="toggleDrawer">
        <v-list-item-icon>
          <v-icon>{{ drawer ? "mdi-chevron-left" : "mdi-menu" }}</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title v-if="drawer">Menu</v-list-item-title>
        </v-list-item-content>
      </v-list-item>-->
    </v-list>

    <v-divider></v-divider>

    <v-list>
      <v-list-item to="/app/home" prepend-icon="mdi-home">
        <v-list-item-title>Home</v-list-item-title>
      </v-list-item>

      <v-list-item to="/app/agendamento" prepend-icon="mdi-calendar-clock">
        <v-list-item-title>Agendamentos</v-list-item-title>
      </v-list-item>

      <v-list-item to="/app/empresa" prepend-icon="mdi-domain">
        <v-list-item-title>Empresa</v-list-item-title>
      </v-list-item>

      <v-list-item to="/app/recurso" prepend-icon="mdi-account-tie">
        <v-list-item-title>Profissional</v-list-item-title>
      </v-list-item>

      <v-list-item to="/app/expediente" prepend-icon="mdi-calendar-multiselect">
        <v-list-item-title>Expediente</v-list-item-title>
      </v-list-item>

      <v-list-item to="/app/servico" prepend-icon="mdi-hammer-wrench">
        <v-list-item-title>Serviço</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { ref } from "vue";

export default {
  setup() {
    const drawer = ref(false); // Menu começa visível
    const toggleDrawer = () => {
      drawer.value = !drawer.value;
    };

    return { drawer, toggleDrawer };
  },
};
</script>
