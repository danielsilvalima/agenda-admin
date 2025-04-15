import DataService from "@/services/DataService";

export default {
  namespaced: true,

  actions: {
    async getDashboard({ commit }, { email, dataInicial, dataFinal, recurso }) {
      try {
        const response = await DataService.getDashboard({
          email,
          dataInicial,
          dataFinal,
          recurso
        });
        return response.data;
      } catch (error) {
        console.error(error.response?.data || error);
        throw error;
      }
    },
  },
};
