import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@vueuse/head'
import App from './App.vue'
import router from './router'
import { route } from './utils/route'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

// Make route helper available globally in templates
app.config.globalProperties.route = route

app.use(pinia)
app.use(router)
app.use(head)

app.mount('#app')
