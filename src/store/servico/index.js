import DataService from "../../services/DataService";

export default {
  namespaced: true,
  // Store (exemplo Vuex)
  state: {
    servico: null,
  },
  getters: {
    getServico: (state) => state.servico,
  },
  mutations: {
    setServico(state, servico) {
      state.servico = servico;
    },
  },
  actions: {
    async buscarServico({ commit }, {id, empresa_recurso_id}) {
      try {
        const response = await DataService.getServico(id, empresa_recurso_id);
        commit("setServico", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data.message || error);
        commit("setServico", null);
        throw error;
      }
    },
    async salvarServico({ commit }, empresa) {
      try {
        const response = await DataService.createServico(empresa);
        commit("setServico", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data.message || error);
        commit("setServico", null);
        throw error;
      }
    },
  },
};
