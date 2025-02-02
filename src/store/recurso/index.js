import DataService from "../../services/DataService";

export default {
  namespaced: true,
  // Store (exemplo Vuex)
  state: {
    recurso: null,
  },
  getters: {
    getRecurso: (state) => state.recurso,
  },
  mutations: {
    setRecurso(state, recurso) {
      state.recurso = recurso;
    },
  },
  actions: {
    async buscarRecurso({ commit }, id) {
      try {
        const response = await DataService.getRecurso(id);
        commit("setRecurso", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data || error);
        commit("setRecurso", null);
        throw error;
      }
    },
    async salvarRecurso({ commit }, formData) {
      try {
        let payload = new FormData();

        // Adiciona os dados individuais
        payload.append("razao_social", formData.get("razao_social"));
        payload.append("cnpj", formData.get("cnpj"));

        // Converte JSON string para objeto antes de adicionar novamente
        const agendaUser = JSON.parse(formData.get("agenda_user"));
        payload.append("agenda_user", JSON.stringify(agendaUser));

        // Trata a lista de recursos
        const recursos = JSON.parse(formData.get("agenda_empresa_recursos"));
        payload.append("agenda_empresa_recursos", JSON.stringify(recursos));
        const response = await DataService.createRecurso(formData);
        commit("setRecurso", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data?.message || error);
        commit("setRecurso", null);
        throw error;
      }
    },
  },
};
