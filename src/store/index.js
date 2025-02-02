import { createStore } from 'vuex';
import storeEmpresa from './empresa';
import storeHorarioExpediente from './horarioExpediente';
import storeExpediente from './expediente';
import storeServico from './servico';
import storeRecurso from './recurso';

export default createStore({
  modules: {
    empresa: storeEmpresa,
    horarioExpediente: storeHorarioExpediente,
    expediente: storeExpediente,
    servico: storeServico,
    recurso: storeRecurso,
  },
});
