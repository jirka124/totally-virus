<template>
  <div class="main-layout">
    <header class="shadow-1"><h2>Totally Virus</h2></header>
    <div class="cont-wrapp scroll">
      <RouterView v-slot="{ Component }">
        <transition name="fade" @before-enter="onBeforeEnter" @before-leave="onBeforeLeave">
          <component :is="Component" />
        </transition>
      </RouterView>
    </div>
    <footer>
      <button @click="router.push({ name: 'index' })" :class="{ active: route.name === 'index' }">
        <i class="fa-solid fa-house"></i>
      </button>
      <button
        @click="router.push({ name: 'scan-file' })"
        :class="{ active: route.name === 'scan-file' }"
      >
        <i class="fa-solid fa-file"></i>
      </button>
      <button
        @click="router.push({ name: 'scan-url' })"
        :class="{ active: route.name === 'scan-url' }"
      >
        <i class="fa-solid fa-globe"></i>
      </button>
    </footer>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function onBeforeEnter(el) {
  el.style.position = 'relative'
}
function onBeforeLeave(el) {
  el.style.position = 'absolute'
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.main-layout {
  display: flex;
  flex-direction: column;
  padding-bottom: var(--safe-area-inset-bottom, 0px);
  padding-top: var(--safe-area-inset-top, 0px);
  padding-left: var(--safe-area-inset-left, 0px);
  padding-right: var(--safe-area-inset-right, 0px);
  height: 100vh;
}
header {
  flex: none;
  display: flex;
  align-items: center;
  height: 44px;
  padding: 0 6px;
  background-color: #0097a7;
}
.cont-wrapp {
  flex: 1 1 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.cont-wrapp > * {
  flex-grow: 1;
  width: 100%;
  padding: 24px 12px;
}
footer {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 1vw;
  height: 60px;
  padding: 0 6px;
  background-color: #f6f6f6;
  border-top: 2px solid #808080;
}
footer > button {
  border: none;
  cursor: pointer;
}
footer > button > i {
  font-size: 30px;
  color: #808080;
}
footer > button:active > i,
footer > button.active > i {
  color: #000;
}
</style>
