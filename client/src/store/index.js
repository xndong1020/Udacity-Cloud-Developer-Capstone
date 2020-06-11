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
  actions: {
    async fetchItems({ commit, state }) {
      commit("setLoading", true);
      const res = await Vue.axios.get("/inventory", {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      commit("SET", {
        key: "items",
        value: res.data.items,
      });
      commit("setLoading", false);
    },
    async createItem({ commit, state }, payload) {
      commit("setLoading", true);
      await Vue.axios.post(
        "/inventory",
        {
          name: payload.name,
          price: parseInt(payload.price),
          unit: parseInt(payload.unit),
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      const res = await Vue.axios.get("/inventory", {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      commit("SET", {
        key: "items",
        value: res.data.items,
      });
      commit("setLoading", false);
    },
    async updateItemUrl({ commit, state }, { inventoryId, file }) {
      commit("setLoading", true);
      const res = await Vue.axios.post(
        `/inventory/${inventoryId}/attachment`,
        null,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.token}`,
          },
        }
      );

      await Vue.axios.put(res.data.uploadUrl, file, {
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      const resp = await Vue.axios.get("/inventory", {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });
      commit("SET", {
        key: "items",
        value: resp.data.items,
      });
      commit("setLoading", false);
    },
    async deleteItem({ commit, state }, inventoryId) {
      commit("setLoading", true);
      try {
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${state.token}`,
        };
        await Vue.axios.delete(`/inventory/${inventoryId}`, {
          headers: headers,
        });
        const res = await Vue.axios.get("/inventory", { headers });
        commit("SET", {
          key: "items",
          value: res.data.items,
        });
      } catch (err) {
        console.log("err", err);
      } finally {
        commit("setLoading", false);
      }
    },
  },
});

export default store;
