<template>
  <div class="url-scn" v-touch-swipe.mouse.horizontal="handleSwipe">
    <p class="par-1">Where should we look for viruses?</p>
    <div v-show="progressIndex === 0" class="input-grp">
      <input v-model="urlVal" type="text" placeholder="https://domain.com/path" class="in-1" />
      <button class="btn-1" @click="handleNextStep">Scan URL</button>
    </div>
    <div v-show="progressIndex > 0" class="label-grp">
      <p class="par-2">{{ dynamicProgressCtx.line }}</p>
      <button class="btn-1" @click="handleNextStep" :disabled="progressIndex === 1">
        {{ dynamicProgressCtx.btn }}
      </button>
    </div>

    <p class="par-1">Previous scan reports</p>
    <div class="prev-res" v-for="report in reports" :key="report.id">
      <div class="prev-res-meta">
        <StatusCircle :status="report.meta.outcome" />
        <p class="prev-res-name">{{ report.meta.URL }}</p>
      </div>
      <button
        class="prev-view-btn btn-1"
        @click="router.push({ name: 'result-url', params: { id: report.id } })"
      >
        View
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, reactive, computed } from 'vue'

import StatusCircle from 'src/components/StatusCircle.vue'

import DemoDataSet from 'src/scripts/DemoDataSetURL'
import { prepareDataSetURL } from 'src/scripts/StatusCodes'

const progressIndex = ref(0)
const urlVal = defineModel()
const router = useRouter()
const reports = reactive(prepareDataSetURL(DemoDataSet))

const dynamicProgressCtx = computed(() => {
  if (progressIndex.value === 1)
    return {
      line: 'Scan is ongoing...',
      btn: 'Scan URL',
    }
  else if (progressIndex.value === 2)
    return {
      line: 'Scan was completed',
      btn: 'New scan',
    }
  else
    return {
      line: 'Scan has failed...',
      btn: 'New scan',
    }
})

const performURLScan = () => {
  // TODO: ...
  progressIndex.value = 1
  setTimeout(() => {
    progressIndex.value = 2
  }, 2000)
}

const handleNextStep = () => {
  if (progressIndex.value === 0) performURLScan()
  if (progressIndex.value === 2 || progressIndex.value === 3) progressIndex.value = 0
}

const handleSwipe = ({ ...event }) => {
  if (event.direction === 'right') return router.push({ name: 'scan-file' })
}
</script>

<style scoped>
.url-scn {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.par-1 {
  font-size: 26px;
}
.input-grp {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.label-grp {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
button {
  width: 240px;
}
.prev-res {
  display: flex;
  align-items: center;
  width: 100%;
}
.prev-res-meta {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pre-res-status {
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
}
.pre-res-status.green {
  background-color: #25ad09;
}
.pre-res-status.red {
  background-color: #e30505;
}
.pre-res-status.yellow {
  background-color: #ffce53;
}
.pre-res-status.black {
  background-color: #000000;
}
.prev-res-name {
  text-align: left;
  flex: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  width: 100px;
}
.prev-view-btn {
  flex: 0;
}
</style>
