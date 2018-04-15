import Vue from 'vue'
import Router from 'vue-router'
import Index from '../views/Index.vue'
import Network from '../views/Network.vue'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Index',
            component: Index
        },
        {
            path: '/network',
            name: 'Network',
            component: Network
        }
    ],
    mode: 'history'
})
