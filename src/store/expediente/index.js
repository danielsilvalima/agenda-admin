import DataService from "../../services/DataService";

export default {
  namespaced: true,
  // Store (exemplo Vuex)
  state: {
    expediente: null,
  },
  getters: {
    getExpediente: (state) => state.expediente,
  },
  mutations: {
    setExpediente(state, expediente) {
      state.expediente = expediente;
    },
  },
  actions: {
    async buscarExpediente({ commit }, {id, empresa_recurso_id}) {
      try {
        const response = await DataService.getExpediente(id, empresa_recurso_id);
        commit("setExpediente", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data.message || error);
        commit("setExpediente", null);
        throw error;
      }
    },
    async salvarExpediente({ commit }, expediente) {
      try {
        const response = await DataService.createExpediente(expediente);
        commit("setExpediente", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data.message || error);
        commit("setExpediente", null);
        throw error;
      }
    },
  },
};
