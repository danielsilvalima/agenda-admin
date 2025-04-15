// router/index.ts

import { createRouter, createWebHistory } from "vue-router";

import DefaultLayout from "../layouts/DefaultLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";

import NotFound from "../components/NotFound.vue";
import Login from "../components/Login.vue";
import Home from "../components/Home.vue";
import Empresa from "../components/Empresa.vue";
import Servico from "../components/Servico.vue";
import Agendamento from "../components/Agendamento.vue";
import Recurso from "../components/Recurso.vue";
import Expediente from "../components/Expediente.vue";

const routes = [
  {
    path: "/",
    component: AuthLayout,
    children: [
      {
        path: "",
        name: "Login",
        component: Login,
      },
    ],
  },
  {
    path: "/app",
    component: DefaultLayout,
    children: [
      {
        path: "home",
        name: "Home",
        component: Home,
        meta: { requiresAuth: true },
      },
      {
        path: "empresa",
        name: "Empresa",
        component: Empresa,
        meta: { requiresAuth: true },
      },
      {
        path: "servico",
        name: "Servico",
        component: Servico,
        meta: { requiresAuth: true },
      },
      {
        path: "agendamento",
        name: "Agendamento",
        component: Agendamento,
        meta: { requiresAuth: true },
      },
      {
        path: "recurso",
        name: "Recurso",
        component: Recurso,
        meta: { requiresAuth: true },
      },
      {
        path: "expediente",
        name: "Expediente",
        component: Expediente,
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Tratamento de erro de módulos dinâmicos do Vite
router.onError((err, to) => {
  if (err?.message?.includes?.("Failed to fetch dynamically imported module")) {
    if (!localStorage.getItem("vuetify:dynamic-reload")) {
      console.log("Reloading page to fix dynamic import error");
      localStorage.setItem("vuetify:dynamic-reload", "true");
      location.assign(to.fullPath);
    } else {
      console.error("Dynamic import error, reloading page did not fix it", err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem("vuetify:dynamic-reload");
});

export default router;
