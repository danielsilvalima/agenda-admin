import DataService from "@/services/DataService";
import { getMessaging, getToken } from "firebase/messaging";

const messaging = getMessaging();

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
    async loginUsuario({ commit, dispatch }, credencial) {
      try {
        const credencialObj = JSON.parse(credencial);
        commit("setUsuario", credencialObj);
        const response = await DataService.getEmpresa(credencialObj.email);

        if (response.data && Object.keys(response.data).length > 0) {
          commit("setEmpresa", response.data);
        }else{
          commit("setEmpresa", null);
        }

        dispatch("atualizarTokenFCM", credencialObj.email);
      } catch (error) {
        console.error("Erro ao fazer login", error.message);
        throw error;
      }
    },
    async buscarEmpresa({ commit }, email) {
      try {
        const response = await DataService.getEmpresa(email);
        commit("setEmpresa", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data.message || error);
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
        console.error(error.response?.data.message || error);
        commit("setEmpresa", null);
        throw error;
      }
    },
    async buscarAgendamentos({ commit }, {id, data}) {
      try {
        const response = await DataService.getAgendamentos(id, data);

        return response.data;
      } catch (error) {
        console.error(error.response?.data.message || error);
        throw error;
      }
    },
    async atualizarTokenFCM({ state, commit }) {
      try {
        const vapidKey =
          import.meta.env.VITE_APP_VAPID_KEY;
        const newToken = await getToken(messaging, { vapidKey });

        if (!newToken) {
          console.warn("Nenhum token FCM gerado.");
          return;
        }

        const usuario = state.usuario;
        if (!usuario || !usuario.email) return;


        if (state.empresa?.token_notificacao !== newToken) {
          console.log("Token do FCM atualizado, enviando para o backend...");

          let data = {email: usuario.email, hash: newToken};
          await DataService.atualizarTokenFCM(data);

          // Atualiza o estado
          commit("setEmpresa", { ...state.empresa, token_notificacao: newToken });
        }
      } catch (error) {
        console.error("Erro ao atualizar token do FCM:", error);
      }
    }
  },
};
