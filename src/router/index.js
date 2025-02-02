
/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
//import { routes } from 'vue-router/auto-routes'
import NotFound from '../components/NotFound.vue'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Empresa from '../components/Empresa.vue'
import Servico from '../components/Servico.vue'
import Agendamento from '../components/Agendamento.vue'
import Recurso from '../components/Recurso.vue'
import Expediente from '../components/Expediente.vue'

const router = createRouter({
  history: createWebHistory(),
    routes: [
      {
        path: "/",
        name: "Login",
        component: Login,
      },
      {
        path: "/home",
        name: "Home",
        component: Home,
      },
      {
        path: "/empresa",
        name: "Empresa",
        component: Empresa,
      },
      {
        path: "/servico",
        name: "Servico",
        component: Servico,
      },
      {
        path: "/agendamento",
        name: "Agendamento",
        component: Agendamento,
      },
      {
        path: "/recurso",
        name: "Recurso",
        component: Recurso,
      },
      {
        path: "/expediente",
        name: "Expediente",
        component: Expediente,
      },
      {
        path: "/:pathMatch(.*)*", // Captura rotas inexistentes
        name: "NotFound",
        component: NotFound,
      },
    ]
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
