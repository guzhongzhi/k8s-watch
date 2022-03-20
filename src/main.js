// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false

import ViewUI from 'view-design';
import 'view-design/dist/styles/iview.css';

import axios from 'axios'
import moment from 'moment'; //导入模块
moment.locale('zh-cn');


//import ECharts from 'vue-echarts' // refers to components/ECharts.vue in webpack
// import ECharts modules manually to reduce bundle size
//import 'echarts/lib/chart/bar'
//import 'echarts/lib/component/tooltip'
// If you want to use ECharts extensions, just import the extension package, and it will work
// Taking ECharts-GL as an example:
// You only need to install the package with `npm install --save echarts-gl` and import it as follows
//import 'echarts-gl'
// register component to use
//Vue.component('v-chart', ECharts)

Vue.prototype.$http = axios;
Vue.prototype.$moment = moment;
Vue.use(ViewUI, {
  transfer: true,
});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
