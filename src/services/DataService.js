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


  getServico(id, empresa_recurso_id) {
    return http_token.get(`/agenda/empresa/servico`,{
      params: { id, empresa_recurso_id }
    });
  }

  getHorarioExpediente() {
    return http_token.get(`/agenda/horario-expediente`)
  }

  createExpediente(data){
    return http_token.post(`/agenda/expediente`, data);
  }

  getExpediente(id, empresa_recurso_id) {
    return http_token.get(`/agenda/expediente`,{
      params: { id, empresa_recurso_id }
    })
  }

  createRecurso(data) {
    return http_token.post(`/agenda/recurso`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  getRecurso(id) {
    return http_token.get(`/agenda/recurso`,{
      params: { id }
    });
  }

  atualizarTokenFCM(data) {
    return http_token.post(`/agenda/empresa/auth`, data);
  }


}

export default new DataService();
