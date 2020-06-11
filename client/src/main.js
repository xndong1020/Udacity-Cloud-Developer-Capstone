import Vue from "vue";
import App from "./App.vue";
import router from "./router";

import axios from "axios";
import VueAxios from "vue-axios";

import store from "./store";
import vuetify from "./plugins/vuetify";

import auth from "@/auth/auth";
Vue.use(auth);

const instance = axios.create({
  baseURL: `https://1yluq7f665.execute-api.us-west-2.amazonaws.com/dev`,
});
Vue.use(VueAxios, instance);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
