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
        width="600px">

        <v-card-item>
            <v-card-title class="text-center ">
                CADASTRO DE SERVIÇO
            </v-card-title>
        </v-card-item>

        <v-card-text>

          <v-row dense>
            <v-col cols="12" md="12">
              <v-text-field
                v-model="service.descricao"
                label="DESCRIÇÂO DO SERVIÇO"
                :rules="[rules.required]"
                placeholder="DIGITE A DECRIÇÃO DO SERVIÇO"
                dense
              ></v-text-field>
            </v-col>

            <v-col cols="6" md="6" >
              <v-text-field density="compact" :rules="[rules.required]" label="VALOR"
                maxLength="7" v-model="service.vlr"
                prefix="R$"
                type="decimal"
                @blur="service.vlr = formatarValorMonetario(service.vlr)"
                id="vlr" name="vlr">
              </v-text-field>
            </v-col>

            <v-col cols="6" md="6">
              <v-text-field
                density="compact"
                :rules="[rules.required]"
                label="DURAÇÃO (HH:MM)"
                v-maska="'##:##'"
                type="time"
                maxLength="5"
                v-model="service.duracao"
                @blur="service.duracao = formatarHorario(service.duracao)"
                id="duracao"
                name="duracao">
              </v-text-field>
            </v-col>

            <v-col cols="12" md="12" class="d-flex justify-end">
              <v-btn color="secondary" @click="adicionarServico" >
                ADICIONAR SERVIÇO
              </v-btn>
            </v-col>
          </v-row>

          <v-list>
            <template v-if="listaServicos.length === 0">
              <v-card class="mb-4">
                <v-list-item
                  color="grey lighten-2"
                  rounded="xl"
                  class="d-flex justify-space-between align-center"
                >
                  <template v-slot:prepend>
                    <strong>NENHUM SERVIÇO CADASTRADO</strong>
                  </template>
                </v-list-item>
              </v-card>
            </template>
            <template v-else>
              <v-card
                v-for="(item, index) in listaServicos" :key="index"
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
                      @click="removerServico(index)"
                    ></v-btn>
                    <strong>{{ item.descricao }}:</strong>
                  </template>
                  <template v-slot:append>
                    <div class="d-flex justify-space-between horario-wrapper">
                      <span class="font-weight-black text-body-2 mt-1 horario">R$ {{ parseFloat(item.vlr || 0).toFixed(2).replace('.', ',') }}</span>
                      <span class="font-weight-black text-body-2 mt-1 horario">{{ formataHora(item.duracao) }}</span>
                    </div>
                  </template>

                </v-list-item>
              </v-card>
            </template>
          </v-list>

        </v-card-text>

        <template v-slot:actions >
          <v-btn block
            :loading="loading"
            color="primary"
            text="CADASTRAR"
            variant="elevated"
            @click="salvarServicos" >
            SALVAR
          </v-btn>
        </template>

    </v-card>

    </SideMenu>
  </v-app>


</template>

<script>
import { mapGetters } from "vuex";
//import SideMenu from "@/components/SideMenu.vue";

export default {
  components: {
    SideMenu: () => import('@/components/SideMenu.vue'),
  },
  data() {
    return {
      loading: false,
      drawer: false,
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
      listaServicos : [],
      rules: {
        required: value => !!value || 'DEVE SER PREENCHIDO',
      },
      service:{
        id: null,
        duracao: null,
        vlr: null,
      },
    };
  },
  computed: {
    ...mapGetters("empresa",["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    ...mapGetters("servico", ["getServico"]),
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
    servico() {
      return this.getServico;
    },
  },
  created() {
    this.listaServicos = [];
    this.service = {
      id: null,
      duracao: null,
      vlr: null,
    };
    this.carregarEmpresa();
    this.$root.setLoadingState(true);
  },
  methods: {
    async carregarEmpresa() {
      this.$root.setLoadingState(true);
      const credencial = localStorage.getItem("googleUserCredential");
      if (credencial) {
        const credencialObj = JSON.parse(credencial);

        try {
          const empresa = await this.$store.dispatch(
            "empresa/buscarEmpresa",
            credencialObj.email
          );

          if (empresa && Object.keys(empresa).length > 0) {

            console.log(empresa?.agenda_empresa_servicos);
            this.listaServicos = empresa.agenda_empresa_servicos.map((item) => ({
              id:item.id,
              duracao: item.duracao,
              vlr: item.vlr,
              descricao: item.descricao
            }));
            console.log(this.listaServicos);
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
    adicionarServico() {
      if (!this.service.descricao || !this.service.vlr || !this.service.duracao) {
        this.alertTitle = "POR FAVOR, PREENCHA TODOS OS CAMPOS ANTES DE ADICIONAR";
        this.snackbar = true;
      } else {
        const duplicado = this.listaServicos.find(
          (servico) => servico.descricao === this.service.descricao
        );
        if (duplicado) {
          this.alertTitle = "ESTE SERVIÇO JÁ FOI ADICIONADO";
          this.snackbar = true;
          return;
        }

        this.service.vlr = parseFloat(this.service.vlr.replace(',', '.')).toFixed(2);

        this.listaServicos.push({ ...this.service });
        this.service = {
          descricao: "",
          vlr: null,
          duracao: null,
        };
      }
    },
    removerServico(index) {
      this.listaServicos.splice(index, 1);
    },
    salvarServicos() {
      this.loading = true;

      this.empresa.agenda_empresa_servicos = this.listaServicos;
      this.listaServicos = this.listaServicos.map(servico => ({
        ...servico,
        vlr: servico.vlr.replace(',', '.'),
      }));

      const payload = {
        razao_social: this.empresa.razao_social,
        cnpj: this.empresa.cnpj,
        agenda_empresa_servicos: this.listaServicos,
        agenda_user: { id: this.empresa.agenda_user.id, email: this.empresa.agenda_user.email },
      };
      this.$store.dispatch("servico/salvarServico", payload)
        .then(() => {
          this.alertTitle = 'SALVO COM SUCESSO';
          this.snackbar = true;

          this.$router.push(`/servico`);
        })
        .catch(error => {
          console.error("ERRO AO SALVAR O SERVIÇO:", error);
          this.alertTitle = 'ERRO AO SALVAR O SERVIÇO: ' + error;
          this.snackbar = true;
        }).finally(() => {
          this.loading = false;
      });
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
    formataHora(hora) {
      if (!hora) return "";
      const [hour, minute] = hora.split(":");
      return `${hour}:${minute}`;
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
  },
};
</script>
<script setup>
  import { vMaska } from "maska/vue"
</script>
