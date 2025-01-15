import http_token from "/http-token";
import http from "/http-common";

class DataService {
  getEmpresa(email) {
    return http_token.get(`/agenda/empresa`, {
      params: { email },
    });
  }

  create(data) {
    return http_token.post(`/agenda/empresa`, data);
  }

  getHorarioExpediente() {
    return http_token.get(`/agenda/horario-expediente`)
  }

  getServico() {
    return http_token.get(`/agenda/servico`)
  }



  /*update(id, data) {
    return http.put(`/task/${id}`, data);
  }

  delete(id) {
    return http.delete(`/task/${id}`);
  }*/

  getCEP(id){
    return http.get(`https://viacep.com.br/ws/${id}/json/`);
  }


}

export default new DataService();
