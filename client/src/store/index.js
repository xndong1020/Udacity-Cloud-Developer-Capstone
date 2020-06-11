import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: true,
  state: {
    items: [],
    token: undefined,
    loading: false,
  },
  mutations: {
    SET(state, payload) {
      Vue.set(state, payload.key, payload.value);
    },
    setLoading(state, value) {
      state.loading = value;
    },
    setToken(state, token) {
      state.token = token;
    },
  },
});

export default store;
