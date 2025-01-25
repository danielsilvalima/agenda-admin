import http_token from "/http-token";

class DataService {
  getEmpresa(email) {
    return http_token.get(`/agenda/empresa`, {
      params: { email },
    });
  }

  create(data) {
    return http_token.post(`/agenda/empresa`, data);
  }
  createServico(data) {
    return http_token.post(`/agenda/servico`, data);
  }

  getAgendamentos(id, data) {
    return http_token.get(`/agenda/empresa/agendamento`, {
      params: { id, data },
    });
  }


  getServico() {
    return http_token.get(`/agenda/servico`)
  }

  getHorarioExpediente() {
    return http_token.get(`/agenda/horario-expediente`)
  }


}

export default new DataService();
