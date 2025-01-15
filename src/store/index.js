import { createStore } from 'vuex';
import storeEmpresa from './empresa';
import storeHorarioExpediente from './horarioExpediente';
import storeServico from './servico';

export default createStore({
  modules: {
    empresa: storeEmpresa,
    horarioExpediente: storeHorarioExpediente,
    servico: storeServico,
  },
});
