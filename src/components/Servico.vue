<template>
  <v-card class="mx-auto my-6" elevation="16">
    <v-card-item>
      <v-card-title class="text-center text-caption">
        CADASTRO DE SERVIÇO
      </v-card-title>
    </v-card-item>

    <v-card-text>
      <v-row dense>
        <v-col cols="12" md="12">
          <p class="secondary-text text-caption text-center">
            ESCOLHA O PROFISSIONAL DESEJADO ABAIXO
          </p>
          <v-window v-model="window" show-arrows>
            <v-window-item
              v-for="(grupo, index) in recursosPaginados"
              :key="index"
            >
              <v-container>
                <v-row justify="center" no-gutters>
                  <v-slide-group show-arrows>
                    <v-slide-group-item
                      v-for="recurso in grupo"
                      :key="recurso.id"
                    >
                      <v-card
                        class="d-flex flex-column justify-center align-center pa-4 mx-2 text-center mb-2"
                        height="110px"
                        width="100px"
                        elevation="2"
                        :class="{ selected: selectedRecurso === recurso }"
                        @click="selecionarRecurso(recurso)"
                      >
                        <v-img
                          :width="50"
                          :height="50"
                          aspect-ratio="16/9"
                          cover
                          style="border-radius: 50%"
                          :src="recurso.path"
                        >
                        </v-img>
                        <span
                          class="text-caption font-weight-bold"
                          style="white-space: normal; word-wrap: break-word"
                        >
                          {{ recurso.descricao }}
                        </span>
                      </v-card>
                    </v-slide-group-item>
                  </v-slide-group>
                </v-row>
              </v-container>
            </v-window-item>
          </v-window>
        </v-col>

        <v-col cols="12" md="12">
          <v-text-field
            density="compact"
            v-model="service.descricao"
            label="DESCRIÇÂO DO SERVIÇO"
            :rules="[rules.required]"
            placeholder="EX: CORTE MASCULINO, UNHA MAO, ALUGUEL QUADRA"
            dense
          ></v-text-field>
        </v-col>

        <v-col cols="6" md="6">
          <v-text-field
            density="compact"
            :rules="[rules.required]"
            label="VALOR"
            maxLength="7"
            v-model="service.vlr"
            prefix="R$"
            type="decimal"
            @blur="service.vlr = formatarValorMonetario(service.vlr)"
            id="vlr"
            name="vlr"
          >
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
            name="duracao"
          >
          </v-text-field>
        </v-col>

        <v-col cols="12" md="12" class="d-flex justify-end">
          <v-btn
            size="small"
            color="secondary"
            @click="adicionarServico"
            class="text-caption"
          >
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
                <strong class="text-caption">NENHUM SERVIÇO CADASTRADO</strong>
              </template>
            </v-list-item>
          </v-card>
        </template>
        <template v-else>
          <v-card
            v-for="(item, index) in listaServicos"
            :key="index"
            class="mb-4"
          >
            <v-list-item
              color="primary"
              rounded="xl"
              class="d-flex justify-space-between align-center"
            >
              <template v-slot:prepend>
                <v-btn
                  size="small"
                  icon="mdi-delete"
                  variant="text"
                  color="red"
                  class="ml-auto text-caption"
                  @click="removerServico(index)"
                ></v-btn>
                <strong
                  >{{ item.descricao }} -
                  {{
                    item.agenda_empresa_recursos?.descricao ||
                    "SEM PROFISSIONAL"
                  }}</strong
                >
              </template>
              <template v-slot:append>
                <div class="d-flex justify-space-between horario-wrapper">
                  <span
                    class="font-weight-black text-body-2 mt-1 horario text-caption"
                    >R$
                    {{ parseFloat(item.vlr).toFixed(2).replace(".", ",") }}
                    /</span
                  >
                  <span
                    class="font-weight-black text-body-2 mt-1 horario text-caption"
                    >{{ formataHora(item.duracao) }}</span
                  >
                </div>
              </template>
            </v-list-item>
          </v-card>
        </template>
      </v-list>
    </v-card-text>

    <template v-slot:actions>
      <v-btn
        size="small"
        block
        class="text-caption"
        :loading="loading"
        color="primary"
        text="CADASTRAR"
        variant="elevated"
        :disabled="selectedRecurso === null"
        @click="salvarServicos"
      >
        SALVAR
      </v-btn>
    </template>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      loading: false,
      listaServicos: [],
      listaRecursos: [],
      rules: {
        required: (value) => !!value || "DEVE SER PREENCHIDO",
      },
      service: {
        id: null,
        duracao: null,
        vlr: null,
      },
      selectedRecurso: null,
      window: 0,
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]),
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
    recursosPaginados() {
      if (!this.listaRecursos || this.listaRecursos.length === 0) return [];

      const itemsPerPage = 5; // Altere conforme necessário
      const paginas = [];

      for (let i = 0; i < this.listaRecursos.length; i += itemsPerPage) {
        paginas.push(this.listaRecursos.slice(i, i + itemsPerPage));
      }

      return paginas;
    },
  },
  watch: {
    empresa: {
      immediate: true, // Executa ao iniciar o componente
      handler(novaEmpresa) {
        if (novaEmpresa) {
          this.carregarRecurso();
        }
      },
    },
  },
  methods: {
    async carregarServico(recurso) {
      if (this.empresa?.id) {
        this.$store.dispatch("loading/showLoading");

        const credencial = localStorage.getItem("googleUserCredential");
        if (credencial) {
          try {
            const empresa = await this.$store.dispatch(
              "servico/buscarServico",
              { id: this.empresa.id, empresa_recurso_id: recurso.id }
            );

            if (empresa && Object.keys(empresa).length > 0) {
              this.listaServicos =
                empresa.agenda_empresa_servicos?.map((item) => ({
                  id: item.id,
                  duracao: item.duracao,
                  vlr: item.vlr,
                  descricao: item.descricao,
                  agenda_empresa_recursos: {
                    descricao: item.agenda_empresa_recursos.descricao,
                    id: item.agenda_empresa_recursos.id,
                    empresa_recurso_id: item.empresa_recurso_id,
                  },
                })) || [];
            }
          } catch (error) {
            console.error("Erro ao carregar empresa: ", error);
            this.$store.dispatch("toast/showToast", {
              message: `Erro ao carregar empresa: ${error}`,
              color: "error",
            });
          } finally {
            this.$store.dispatch("loading/hideLoading");
          }
        }
      }
    },
    async carregarRecurso() {
      if (this.empresa?.id) {
        this.$store.dispatch("loading/showLoading");
        const credencial = localStorage.getItem("googleUserCredential");
        if (credencial) {
          try {
            const empresa = await this.$store.dispatch(
              "recurso/buscarRecurso",
              this.empresa.id
            );

            if (empresa && Object.keys(empresa).length > 0) {
              this.listaRecursos = empresa.agenda_empresa_recursos?.map(
                (item) => ({
                  id: item.id,
                  descricao: item.descricao,
                  path: `${import.meta.env.VITE_APP}/storage/${item.path}`,
                })
              );
            }
          } catch (error) {
            console.error(
              "Erro ao carregar empresa: ",
              error.response.data.message
            );

            this.$store.dispatch("toast/showToast", {
              message: `Erro ao carregar empresa: ${error}`,
              color: "error",
            });
          } finally {
            this.$store.dispatch("loading/hideLoading");
          }
        }
      }
    },
    adicionarServico() {
      if (
        !this.service.descricao ||
        !this.service.vlr ||
        !this.service.duracao
      ) {
        this.$store.dispatch("toast/showToast", {
          message: `Por favor, preencha todos os campos antes de adicionar`,
          color: "warning",
        });
        return;
      } else if (this.selectedRecurso === null) {
        this.$store.dispatch("toast/showToast", {
          message: `Por favor, selecione um dos profissionais disponíveis`,
          color: "warning",
        });
        return;
      } else {
        const duplicado = this.listaServicos.find(
          (servico) => servico.descricao === this.service.descricao
        );
        if (duplicado) {
          this.$store.dispatch("toast/showToast", {
            message: `Este serviço já foi adicionado`,
            color: "warning",
          });
          return;
        }

        //this.service.vlr = parseFloat(this.service.vlr.replace(',', '.')).toFixed(2);

        this.listaServicos.push({
          ...this.service,
          agenda_empresa_recursos: {
            id: this.selectedRecurso.id,
            descricao: this.selectedRecurso.descricao,
          },
        });

        this.service = {
          descricao: null,
          vlr: null,
          duracao: null,
        };
      }
    },
    removerServico(index) {
      this.listaServicos.splice(index, 1);
    },
    salvarServicos() {
      if (!this.empresa.id) {
        this.$store.dispatch("toast/showToast", {
          message: `É necessário cadastrar a empresa`,
          color: "warning",
        });
        return;
      }
      this.loading = true;

      this.empresa.agenda_empresa_servicos = this.listaServicos;
      this.listaServicos = this.listaServicos.map((servico) => ({
        ...servico,
        vlr: servico.vlr.replace(",", "."),
      }));
      const payload = {
        id: this.empresa.id,
        razao_social: this.empresa.razao_social,
        cnpj: this.empresa.cnpj,
        agenda_empresa_recursos: this.selectedRecurso.id,
        agenda_empresa_servicos: this.listaServicos,
        agenda_user: {
          id: this.empresa.agenda_user?.id,
          email: this.empresa.agenda_user?.email,
        },
      };
      this.$store
        .dispatch("servico/salvarServico", payload)
        .then(() => {
          this.$store.dispatch("toast/showToast", {
            message: `Salvo com sucesso`,
            color: "success",
          });
          this.loading = false;
        })
        .catch((error) => {
          console.error(
            "Erro ao salvar o serviço:",
            error.response.data.message
          );
          this.$store.dispatch("toast/showToast", {
            message: `Erro ao salvar o serviço: ${error}`,
            color: "error",
          });
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
    selecionarRecurso(index) {
      this.carregarServico(index);
      this.selectedRecurso = index;
    },
  },
};
</script>
<script setup>
import { vMaska } from "maska/vue";
</script>

<style>
.selected {
  border: 2px solid #1976d2; /* Cor azul do Vuetify */
  background-color: rgba(25, 118, 210, 0.2); /* Leve realce no fundo */
  transition: all 0.3s ease-in-out;
}
</style>
