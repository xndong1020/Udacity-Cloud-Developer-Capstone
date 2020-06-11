<template>
  <v-app id="app">
    <div>
      <v-app-bar color="indigo darken-2" dark>
        <v-app-bar-nav-icon></v-app-bar-nav-icon>

        <v-toolbar-title>Udacity Inventory Management</v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn icon>
          <v-icon>mdi-heart</v-icon>
        </v-btn>

        <div>
          <span class="text-muted font-weight-light px-2">{{
            $auth.user ? $auth.user.name : ""
          }}</span>
          <v-btn type="button" color="primary" @click="$auth.logout()"
            >Logout</v-btn
          >
        </div>
      </v-app-bar>
    </div>
    <router-view />
  </v-app>
</template>

<script>
export default {
  name: "App",
};
</script>
