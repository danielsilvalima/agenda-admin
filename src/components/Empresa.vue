<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="timeout"
  >
  {{ alertTitle }}

    <template v-slot:actions>
      <v-btn
        color="blue"
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
  <v-app>
    <SideMenu>
      <v-card class="mx-auto my-6"
        elevation="16"
        max-width="450">

        <v-card-item>
            <v-card-title class="text-center ">
                CADASTRO DE EMPRESA
            </v-card-title>
        </v-card-item>

        <v-card-text>
          <v-row dense >
            <v-col cols="12" md="12" >
                <v-text-field density="compact" :rules="[rules.required]" label="RAZÃO SOCIAL"
                  maxLength="100" v-model="form.razao_social"
                id="razao_social" name="razao_social"></v-text-field>
            </v-col>

            <v-col cols="12" md="12" >
                <v-text-field density="compact" :rules="[rules.required]" label="CNPJ/CPF"
                  maxLength="20" v-model="form.cnpj"
                id="cnpj" name="cnpj"></v-text-field>
            </v-col>

            <v-col cols="12" md="12" >
                <v-text-field density="compact" readonly :rules="[rules.required]" label="NOME COMPLETO"
                  maxLength="100" v-model="form.nome_completo"
                id="nome_completo" name="nome_completo"></v-text-field>
            </v-col>

            <v-col cols="12" md="12" >
                <v-text-field density="compact" :rules="[rules.required]" label="CELULAR" v-maska="'(##) #.####-####'"
                  maxLength="16" v-model="form.celular"
                id="celular" name="celular"></v-text-field>
            </v-col>

            <v-col cols="12" md="12" >
                <v-text-field density="compact" readonly label="E-MAIL"
                  maxLength="100" v-model="form.email"
                id="email" name="email"></v-text-field>
            </v-col>

            <v-col cols="12" md="12" >
                <v-text-field density="compact" readonly label="LINK PARA CLIENTE"
                  maxLength="100" v-model="form.hash"
                id="hash" name="hash"
                append-inner-icon="mdi-content-copy"
                @click:append-inner="copiarTexto"></v-text-field>
            </v-col>

          </v-row>

          <!-- Expansível para o expediente -->
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>GERENCIAR EXPEDIENTE</v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-row dense>

                  <v-col cols="12" md="12">
                    <v-select
                      density="compact"
                      :items="diasDisponiveis"
                      label="DIA DA SEMANA"
                      v-model="expediente.horario_expediente_id"
                      item-value="id"
                      item-title="descricao"
                    ></v-select>
                  </v-col>

                  <v-col cols="6" md="6" >
                    <v-text-field density="compact" :rules="[rules.required]" label="HORA ABERTURA" v-maska="'##:##'"
                      maxLength="5" v-model="expediente.hora_abertura" type="time"
                      @blur="expediente.hora_abertura = formatarHorario(expediente.hora_abertura)"
                      id="hora_abertura" name="hora_abertura"></v-text-field>
                  </v-col>

                  <v-col cols="6" md="6" >
                    <v-text-field density="compact" :rules="[rules.required]" label="HORA FECHAMENTO" v-maska="'##:##'"
                      maxLength="5" v-model="expediente.hora_fechamento" type="time"
                      @blur="expediente.hora_fechamento = formatarHorario(expediente.hora_fechamento)"
                      id="hora_fechamento" name="hora_fechamento"></v-text-field>
                  </v-col>

                  <v-col cols="6" md="6" >
                    <v-text-field density="compact" :rules="[rules.required]" label="INÍCIO INTERVALO" v-maska="'##:##'"
                      maxLength="5" v-model="expediente.intervalo_inicio" type="time"
                      @blur="expediente.intervalo_inicio = formatarHorario(expediente.intervalo_inicio)"
                      id="intervalo_inicio" name="intervalo_inicio"></v-text-field>
                  </v-col>

                  <v-col cols="6" md="6" >
                    <v-text-field density="compact" :rules="[rules.required]" label="TÉRMINO INTERVALO" v-maska="'##:##'"
                      maxLength="5" v-model="expediente.intervalo_fim" type="time"
                      @blur="expediente.intervalo_fim = formatarHorario(expediente.intervalo_fim)"
                      id="intervalo_fim" name="intervalo_fim"></v-text-field>
                  </v-col>

                  <v-col cols="12" md="12">
                    <v-btn block color="secondary" @click="adicionarExpediente">
                      ADICIONAR EXPEDIENTE
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- Lista de expedientes adicionados -->
                <v-list>
                  <v-card
                    v-for="(item, index) in form.listaExpedientes" :key="index"
                    class="mb-4"
                  >
                    <v-list-item
                      color="primary"
                      rounded="xl"
                      class="d-flex justify-space-between align-center"
                    >
                      <template v-slot:prepend>
                        <v-btn
                          icon="mdi-delete"
                          variant="text" color="red"
                          class="ml-auto "
                          @click="removerExpediente(index)"
                        ></v-btn>
                        <strong>{{ getDiaDescricao(item.horario_expediente_id) }}:</strong>
                      </template>
                      <template v-slot:append>
                        <div class="d-flex justify-space-between horario-wrapper">
                          <span class="font-weight-black text-body-2 mt-1 horario">{{ formataHora(item.hora_abertura) }}</span>
                          <span class="font-weight-black text-body-2 mt-1 horario">{{ formataHora(item.intervalo_inicio) }}</span>
                          <span class="font-weight-black text-body-2 mt-1 horario">{{ formataHora(item.intervalo_fim) }}</span>
                          <span class="font-weight-black text-body-2 mt-1 horario">{{ formataHora(item.hora_fechamento) }}</span>
                        </div>
                      </template>

                    </v-list-item>
                  </v-card>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

          <!-- Expansível para o serviço -->
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-title>GERENCIAR SERVIÇOS</v-expansion-panel-title>
              <v-expansion-panel-text>

                  <!-- Lista de expedientes adicionados -->
                  <v-list>
                  <v-card
                    v-for="(item, index) in form.listaServicos" :key="index"
                    class="mb-4"
                  >
                    <v-list-item
                      color="primary"
                      rounded="xl"
                      class="d-flex justify-space-between align-center"
                    >
                      <template v-slot:prepend>
                        <strong>{{ getServicoDescricao(item.id) }}</strong>
                      </template>
                      <template v-slot:append>
                        <div class="d-flex justify-space-between horario-wrapper">
                          <span class="font-weight-black text-body-2 mt-1 horario">R$ {{ parseFloat(item.vlr || 0).toFixed(2).replace('.', ',') }}</span>
                          <span class="font-weight-black text-body-2 mt-1 horario">{{ formataHora(item.duracao) }}</span>
                        </div>
                      </template>

                    </v-list-item>
                  </v-card>
                  </v-list>

              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>

        </v-card-text>

        <template v-slot:actions >
          <v-btn block
            :loading="loading"
            color="primary"
            text="CADASTRAR"
            variant="elevated"
            @click="salvarEmpresa" >
            SALVAR
          </v-btn>
        </template>

    </v-card>
    </SideMenu>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import SideMenu from "@/components/SideMenu.vue";
import DataService from "../services/DataService";
import router from "@/router";

export default {
  components: {
    SideMenu,
  },
  data() {
    return {
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
      drawer: false,
      loading: false,
      form: {
        razao_social: "",
        cnpj: "",
        nome_completo: "",
        celular: "",
        email: "",
        hash: "",
        listaExpedientes: [],
        listaServicos: [],
      },
      rules: {
        required: value => !!value || 'DEVE SER PREENCHIDO',
      },
      expediente: {
        horario_expediente_id: null,
        hora_abertura: null,
        hora_fechamento: null,
        intervalo_inicio: null,
        intervalo_fim: null,
      },
      service:{
        id: null,
        duracao: null,
        vlr: null,
      },
      diasDaSemana: [],
      servicos: [],
      diasDisponiveis: [],
      servicosDisponiveis: [],
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    ...mapGetters("servico", ["getServico"]),
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
    horario_expediente() {
      return this.getHorarioExpediente;
    },
    servico() {
      return this.getServico;
    },
  },
  created() {
    this.diasDaSemana = [];
    this.servicos = [];
    this.diasDisponiveis = [];
    this.form.listaExpedientes = [];
    this.form.listaServicos = [];
    this.expediente = {
      horario_expediente_id: null,
      hora_abertura: null,
      hora_fechamento: null,
      intervalo_inicio: null,
      intervalo_fim: null,
    };
    this.service = {
      id: null,
      duracao: null,
      vlr: null,
    };
    this.carregarDiasSemana();
    this.carregarEmpresa();
    this.carregarServicos();
  },
  methods: {
    async salvarEmpresa() {
      if(this.form.celular === '' || String(this.formataCelular(this.form.celular)).length < 11){
        this.alertTitle = 'CELULAR INVÁLIDO';
        this.snackbar = true;
        return;
      }

      if(this.empresa?.expiration){
        this.alertTitle = this.empresa?.message;
        this.snackbar = true;
        return;
      }

      this.form.celular = this.formataCelular(this.form.celular);
      this.loading = true;
      try{
        const empresa = await this.$store.dispatch(
          "empresa/salvarEmpresa", this.form
        );

        if(empresa === null){
          this.$store.commit("empresa/setEmpresa", null);
        }else{
          this.$store.commit("empresa/setEmpresa", empresa);
        }

        this.alertTitle = 'SALVO COM SUCESSO';
        this.snackbar = true;

        router.push("/empresa");
      } catch (error) {
        console.error("ERRO AO CARREGAR SERVIÇOS: ", error);
        this.alertTitle = "ERRO AO CARREGAR SERVIÇOS: " + error;
        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },
    async carregarServicos() {
      try {
        const servicos = await this.$store.dispatch(
          "servico/buscarServico"
        );
        this.servicos = servicos.map((servico) => ({
          id: servico.id,
          descricao: servico.descricao
        }));

        this.atualizarServicosDisponiveis();
      } catch (error) {
        console.error("ERRO AO CARREGAR SERVIÇOS: ", error);
        this.alertTitle = "ERRO AO CARREGAR SERVIÇOS: " + error;
        this.snackbar = true;
      }
    },
    async carregarDiasSemana() {
      try {
        const dias = await this.$store.dispatch(
          "horarioExpediente/buscarHorarioExpediente"
        );
        this.diasDaSemana = dias.map((dia) => ({
          id: dia.id,
          descricao: dia.descricao,
        }));

        this.atualizarDiasDisponiveis();
        this.atualizarServicosDisponiveis();
      } catch (error) {
        console.error("ERRO AO CARREGAR DIAS DA SEMANA: ", error);
        this.alertTitle = "ERRO AO CARREGAR DIAS DA SEMANA: " + error;
        this.snackbar = true;
      }
    },
    async carregarEmpresa() {
      this.$root.setLoadingState(true);
      const credencial = localStorage.getItem("googleUserCredential");
      if (credencial) {
        const credencialObj = JSON.parse(credencial);
        this.form.email = credencialObj.email;
        this.form.nome_completo = credencialObj.name;
        try {
          const empresa = await this.$store.dispatch(
            "empresa/buscarEmpresa",
            credencialObj.email
          );

          if (empresa && Object.keys(empresa).length > 0) {

            this.form.razao_social = empresa.razao_social;
            this.form.cnpj = empresa.cnpj;
            this.form.hash = empresa?.hash;
            this.form.celular = empresa.agenda_user?.celular;
            this.form.listaExpedientes = empresa.agenda_empresa_expedientes.map((item) => ({
              horario_expediente_id:item.horario_expediente_id,
              hora_abertura: item.hora_abertura,
              hora_fechamento: item.hora_fechamento,
              intervalo_inicio: item.intervalo_inicio,
              intervalo_fim: item.intervalo_fim,
            }));

            this.form.listaServicos = empresa.agenda_empresa_servicos.map((item) => ({
              id:item.id,
              duracao: item.duracao,
              vlr: item.vlr,
            }));

            this.atualizarDiasDisponiveis();
            this.atualizarServicosDisponiveis();
          }
        } catch (error) {
          console.error("ERRO AO CARREGAR EMPRESA: ", error);
          this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error;
          this.snackbar = true;
        } finally {
          this.$root.setLoadingState(false);
        }
      }
    },
    atualizarDiasDisponiveis() {
      const diasJaAdicionados = this.form.listaExpedientes.map(
        (expediente) => expediente.horario_expediente_id
      );
      this.diasDisponiveis = this.diasDaSemana.filter(
        (dia) => !diasJaAdicionados.includes(dia.id)
      );
    },
    atualizarServicosDisponiveis() {
      const servicosJaAdicionados = this.form.listaServicos.map(
        (servico) => servico.id
      );
      this.servicosDisponiveis = this.servicos.filter(
        (servico) => !servicosJaAdicionados.includes(servico.id)
      );
    },
    adicionarExpediente() {
      if (
        this.expediente.horario_expediente_id !== null &&
        this.expediente.hora_abertura &&
        this.expediente.hora_fechamento &&
        this.expediente.intervalo_inicio &&
        this.expediente.intervalo_fim
      ) {
        this.form.listaExpedientes.push({ ...this.expediente });
        this.expediente = {
          horario_expediente_id: null,
          hora_abertura: null,
          hora_fechamento: null,
          intervalo_inicio: null,
          intervalo_fim: null,
        };
        this.atualizarDiasDisponiveis();
      } else {
        this.alertTitle = "POR FAVOR, PREENCHA TODOS OS CAMPOS ANTES DE ADICIONAR";
        this.snackbar = true;
      }
    },
    adicionarServico() {
      if (
        this.service.id !== null &&
        this.service.duracao &&
        this.service.vlr
      ) {
        this.form.listaServicos.push({ ...this.service });
        this.expediente = {
          id : null,
          duracao : null,
          vlr: null
        };
        this.atualizarServicosDisponiveis();
      } else {
        this.alertTitle = "POR FAVOR, PREENCHA TODOS OS CAMPOS ANTES DE ADICIONAR";
        this.snackbar = true;
      }
    },
    removerExpediente(index) {
      this.form.listaExpedientes.splice(index, 1);
      this.atualizarDiasDisponiveis();
    },
    removerServico(index) {
      this.form.listaServicos.splice(index, 1);
      this.atualizarServicosDisponiveis();
    },
    getDiaDescricao(horario_expediente_id) {
      const dia = this.diasDaSemana.find(
        (item) => item.id === horario_expediente_id
      );
      return dia ? dia.descricao : "DIA NÃO ENCONTRADO";
    },
    getServicoDescricao(id) {
      const descricao = this.servicos.find(
        (item) => item.id === id
      );
      return descricao ? descricao.descricao : "SERVIÇO NÃO ENCONTRADO";
    },
    formataCelular(celular){
        return celular.replace(" ", "").replace("-", "").replace(".", "").replace(/"/g, "").replace(/'/g, "").replace(/\(|\)/g, "");
    },
    formataHora(hora) {
      if (!hora) return "";
      const [hour, minute] = hora.split(":");
      return `${hour}:${minute}`;
    },
    formatarHorario(input) {
      if (!input) return "";

      // Converte para string e remove caracteres não numéricos
      const digits = input.toString().replace(/\D/g, "");

      // Verifica o comprimento do valor e formata adequadamente
      switch (digits.length) {
        case 1:
          return `0${digits}:00`; // Ex.: 1 -> 01:00
        case 2:
          return `${digits}:00`; // Ex.: 11 -> 11:00
        case 3:
          return `${digits.slice(0, 2)}:${digits.slice(2, 3)}0`; // Ex.: 111 -> 11:10
        case 4:
          return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`; // Ex.: 1111 -> 11:11
        default:
          return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`; // Ignora dígitos extras
      }
    },
    formatarValorMonetario(input) {
      if (!input) return "0,00";

      // Remove caracteres não numéricos, exceto vírgula
      input = input.replace(/[^0-9,]/g, "");

      // Verificar se já contém uma vírgula
      if (input.includes(",")) {
        let [reais, centavos = ""] = input.split(",");

        // Ajustar centavos para exatamente 2 dígitos
        if (centavos.length === 0) {
          centavos = "00";
        } else if (centavos.length === 1) {
          centavos = `${centavos}0`;
        } else if (centavos.length > 2) {
          centavos = centavos.slice(0, 2);
        }

        return `${reais},${centavos}`;
      }

      // Se não contém vírgula, adiciona ",00" no final
      return `${input},00`;
    },
    copiarTexto() {
      // Seleciona o texto do campo
      const input = document.getElementById("hash");
      if (input) {
        input.select();
        input.setSelectionRange(0, 99999); // Para compatibilidade com dispositivos móveis

        // Copia para a área de transferência
        navigator.clipboard.writeText(input.value).then(() => {
          this.$emit("copiado"); // Emite um evento, se necessário
          this.alertTitle = "LINK COPIADO PARA A ÁREA DE TRANSFERÊNCIA!";
          this.snackbar = true;
        }).catch(() => {
          this.alertTitle = "ERRO AO COPIAR O LINK";
          this.snackbar = true;
        });
      }
    }
  },
};
</script>

<script setup>
  import { vMaska } from "maska/vue"
</script>
<style>
.horario-wrapper {
  gap: 5px; /* Ajuste o espaçamento entre os horários */
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
}

.horario {
  text-align: right;
  margin-left: 5px; /* Caso precise de mais espaçamento interno */
}
</style>
