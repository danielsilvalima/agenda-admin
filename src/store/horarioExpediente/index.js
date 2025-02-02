import DataService from "../../services/DataService";

export default {
  namespaced: true,
  // Store (exemplo Vuex)
  state: {
    horario_expediente: null,
  },
  getters: {
    getHorarioExpediente: (state) => state.horario_expediente,
  },
  mutations: {
    setHorarioExpediente(state, horario_expediente) {
      state.horario_expediente = horario_expediente;
    },
  },
  actions: {
    async buscarHorarioExpediente({ commit }, ) {
      try {
        const response = await DataService.getHorarioExpediente();
        commit("setHorarioExpediente", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data.message || error);
        commit("setHorarioExpediente", null);
        throw error;
      }
    },
  },
};
