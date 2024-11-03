<script setup>
</script>

<template>
  <div>
    <div class="center-box">
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.center-box {
  width: 960px;
  height: 720px;
  background-color: #efefef;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid #333;
}
</style>
