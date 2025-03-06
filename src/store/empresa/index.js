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
        console.log("LOGIN");
        const credencialObj = JSON.parse(credencial);
        commit("setUsuario", credencialObj);
        const response = await DataService.getLogin(credencialObj.email);

        if (response.data && Object.keys(response.data).length > 0) {
          commit("setEmpresa", response.data);
        }else{
          commit("setEmpresa", null);
        }

        dispatch("atualizarToken", credencialObj.email);
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
    async atualizarToken({ state, commit }, email) {
      try {
        console.log("ENTROU");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          //console.warn("Permissão para notificações negada.");
          return;
        }

        const vapidKey =
          import.meta.env.VITE_APP_VAPID_KEY;
        const newToken = await getToken(messaging, { vapidKey });

        /*if (!newToken) {
          //console.warn("Nenhum token gerado.");
          return;
        }*/

        const empresa = state.empresa;
        /*if (!empresa || empresa.token_notificacao === newToken) {
          //console.log("Token já está atualizado.");
          return;
        }*/



        console.log("Token atualizado, enviando para o backend...");
        let data = { email: email, hash: newToken };
        await DataService.atualizarToken(data);

        commit("setEmpresa", { ...empresa, token_notificacao: newToken });
      } catch (error) {
        console.error("Erro ao atualizar token do FCM:", error);
      }
    }
  },
};
