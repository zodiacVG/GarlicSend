import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import DownloadPage from '../views/DownloadPage.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/download',
    name: 'download',
    component: DownloadPage
  }
]

const router = new VueRouter({
  routes
})

export default router
