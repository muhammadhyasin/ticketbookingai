import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

// Create Pinia instance first
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Install plugins
app.use(pinia)
app.use(router)

// Mount the app
app.mount('#app') 