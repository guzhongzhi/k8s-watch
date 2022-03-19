import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/view/Index'

Vue.use(Router);

var router = new Router({
  mode:"history",
  routes: [
    {
      path: '/',
      name: 'index',
      component: Index
    },
  ]
});
router.beforeEach((to, from, next) => {
  window.pageHistory.push(from);
  next();
});

export default router
