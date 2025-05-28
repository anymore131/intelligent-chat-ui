<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
  <router-view />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

html,
body {
  height: 100%;
  width: 100%;
}

#app {
  height: 100%;
  width: 100%;
}
</style>
