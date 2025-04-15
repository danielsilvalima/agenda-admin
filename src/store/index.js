import { createStore } from 'vuex';
import storeEmpresa from './empresa';
import storeHorarioExpediente from './horarioExpediente';
import storeExpediente from './expediente';
import storeServico from './servico';
import storeRecurso from './recurso';
import storeToast from './toast';
import storeLoading from './loading';
import storeDashboard from './dashboard';

export default createStore({
  modules: {
    empresa: storeEmpresa,
    horarioExpediente: storeHorarioExpediente,
    expediente: storeExpediente,
    servico: storeServico,
    recurso: storeRecurso,
    toast: storeToast,
    loading: storeLoading,
    dashboard: storeDashboard,
  },
});
