import { PaymentScreen, PaymentNotification } from '@/renderer/screens'
import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: PaymentScreen,
      meta: {
        titleKey: 'title.main'
      }
    },
    {
      path: '/confirmation',
      name: 'confirmation',
      component: PaymentNotification,
      meta: {
        titleKey: 'title.main'
      }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})
