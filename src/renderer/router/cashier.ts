import { PaymentScreen, PaymentNotification } from '@/renderer/screens'
import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: PaymentScreen,
      props: true,
      meta: {
        titleKey: 'title.main'
      }
    },
    {
      path: '/confirmation/:success/:response',
      name: 'confirmation',
      component: PaymentNotification,
      props: true,
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
