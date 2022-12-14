import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
// 引入全局样式文件
import './assets/css/global.css'
import './assets/font/iconfont.css'
import SocketService from './utils/scoket_service'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/'
SocketService.Instance.connect()
Vue.prototype.$socket = SocketService.Instance
Vue.prototype.$http = axios
Vue.prototype.$echarts = window.echarts
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: (h) => h(App)
}).$mount('#app')
