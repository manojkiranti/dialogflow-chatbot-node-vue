import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import PerfectScrollbar from "vue2-perfect-scrollbar";
import "vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css";
import VueSimpleAccordion from "vue-simple-accordion";
import "vue-simple-accordion/dist/vue-simple-accordion.css";
import lineClamp from "vue-line-clamp";

Vue.use(lineClamp, {
  importCss: true,
});

Vue.use(VueSimpleAccordion, {
  // ... Options go here
});
Vue.use(PerfectScrollbar);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
