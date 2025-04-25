<template>
  <div class="index" v-touch-swipe.mouse.horizontal="handleSwipe">
    <picture class="virus-illus">
      <source
        type="image/webp"
        srcset="@/assets/virus-illustration.webp"
        width="500"
        height="500"
      />
      <source type="image/png" srcset="@/assets/virus-illustration.png" width="500" height="500" />
      <img src="data:," alt="virus illustration" width="500" height="500" loading="lazy" />
    </picture>
    <p class="par-1">There is totally a virus on your machine, we promise...</p>
    <p class="par-2">But calm down we can find it :)</p>
    <button class="btn-1" @click="router.push({ name: 'scan-file' })">Scan files</button>
    <button class="btn-1" @click="router.push({ name: 'scan-url' })">Scan URLs</button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleSwipe = ({ ...event }) => {
  if (event.direction === 'left') return router.push({ name: 'scan-file' })
}
</script>

<style scoped>
.index {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.virus-illus {
  width: 300px;
}
.virus-illus > img {
  width: 100%;
}
.par-1 {
  font-size: 26px;
}
.par-2 {
}
button {
  width: 240px;
}
</style>
