import Vue from 'vue'
import VueRouter from 'vue-router'
import SellerPage from '@/views/SellerPage'
import TrendPage from '@/views/TrendPage'
import MapPage from '@/views/MapPage'
import RankPage from '@/views/RankPage'
import HotPage from '@/views/HotPage'
import StockPage from '@/views/StockPage'
Vue.use(VueRouter)

const routes = [
  {
    path: '/sellerPage',
    name: 'SellerPage',
    component: SellerPage
  },
  {
    path: '/trendPage',
    name: 'TrendPage',
    component: TrendPage
  },
  {
    path: '/mapPage',
    name: 'MapPage',
    component: MapPage
  },
  {
    path: '/rankPage',
    name: 'RankPage',
    component: RankPage
  },
  {
    path: '/hotPage',
    name: 'HotPage',
    component: HotPage
  },
  {
    path: '/stockPage',
    name: 'StockPage',
    component: StockPage
  }
]

const router = new VueRouter({
  routes
})

export default router
