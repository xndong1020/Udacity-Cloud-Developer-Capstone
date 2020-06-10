<template>
  <div class="callback">Callback</div>
</template>

<script>
export default {
  name: "callback",
  mounted() {
    this.$auth.handleAuthentication().then(() => {
      this.$router.push({ name: "home" });
    });
  },
};
</script>
