import DataService from "../../services/DataService";

export default {
  namespaced: true,
  // Store (exemplo Vuex)
  state: {
    usuario: null,
    empresa: null,
    token: null,
  },
  getters: {
    getEmpresa: (state) => state.empresa,
    getToken: (state) => state.token,
  },
  mutations: {
    setUsuario(state, usuario) {
      state.usuario = usuario;
    },
    setEmpresa(state, empresa) {
      state.empresa = empresa;
    },
    setToken(state, token) {
      state.token = token;
    },
  },
  actions: {
    async loginUsuario({ commit }, credencial) {
      try {
        const credencialObj = JSON.parse(credencial);
        commit("setUsuario", credencialObj);
        const response = await DataService.getEmpresa(credencialObj.email);

        if (response.data && Object.keys(response.data).length > 0) {
          commit("setEmpresa", response.data);
        }else{
          commit("setEmpresa", null);
        }
      } catch (error) {
        console.error("Erro ao fazer login", error);
        throw error;
      }
    },
    async buscarEmpresa({ commit }, email) {
      try {
        const response = await DataService.getEmpresa(email);
        commit("setEmpresa", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data || error);
        commit("setEmpresa", null);
        throw error;
      }
    },
    async salvarEmpresa({ commit }, empresa) {
      try {
        const response = await DataService.create(empresa);
        commit("setEmpresa", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data || error);
        commit("setEmpresa", null);
        throw error;
      }
    },
    async buscarAgendamentos({ commit }, {id, data}) {
      try {
        const response = await DataService.getAgendamentos(id, data);

        return response.data;
      } catch (error) {
        console.error(error.response?.data || error);
        throw error;
      }
    },
  },
};
