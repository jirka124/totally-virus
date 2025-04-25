<template>
  <div class="file-scn" v-touch-swipe.mouse.horizontal="handleSwipe">
    <p class="par-1">Where should we look for viruses?</p>
    <div v-show="progressIndex === 0" class="no-file-grp">
      <p class="par-2">No file selected...</p>
      <div class="upload-btn">
        <label for="scanfile" class="btn-1">Select file</label>
        <input
          style="opacity: 0"
          type="file"
          id="scanfile"
          name="scanfile"
          @change="handleFileUpload"
        />
      </div>
    </div>
    <div v-show="progressIndex > 0" class="yes-file-grp">
      <p class="par-2">{{ dynamicProgressCtx.line }}</p>
      <button class="btn-1" @click="handleNextStep" :disabled="progressIndex === 2">
        {{ dynamicProgressCtx.btn }}
      </button>
    </div>

    <p class="par-1">Previous scan reports</p>
    <div class="prev-res" v-for="report in reports" :key="report.id">
      <div class="prev-res-meta">
        <StatusCircle :status="report.meta.outcome" />
        <p class="prev-res-name">{{ report.meta.fileName }} ({{ report.meta.fileSizeStr }})</p>
      </div>
      <button
        class="prev-view-btn btn-1"
        @click="router.push({ name: 'result-file', params: { id: report.id } })"
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

import DemoDataSet from 'src/scripts/DemoDataSetFile'
import { prepareDataSetFile, resolveFileSize } from 'src/scripts/StatusCodes'

const progressIndex = ref(0)
const uploadedFile = ref(null)
const router = useRouter()

const reports = reactive(prepareDataSetFile(DemoDataSet))

const dynamicProgressCtx = computed(() => {
  if (progressIndex.value === 1)
    return {
      line: `${uploadedFile.value.name} (${resolveFileSize(uploadedFile.value.size)})`,
      btn: 'Scan file',
    }
  else if (progressIndex.value === 2)
    return {
      line: 'Scan is ongoing...',
      btn: 'Scan file',
    }
  else if (progressIndex.value === 3)
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

const performFileScan = () => {
  // TODO: ...
  progressIndex.value = 2
  setTimeout(() => {
    progressIndex.value = 3
  }, 2000)
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return (progressIndex.value = 0)

  progressIndex.value = 1
  uploadedFile.value = file
}

const handleNextStep = () => {
  if (progressIndex.value === 1) performFileScan()
  if (progressIndex.value === 3 || progressIndex.value === 4) progressIndex.value = 0
}

const handleSwipe = ({ ...event }) => {
  if (event.direction === 'right') return router.push({ name: 'index' })
  if (event.direction === 'left') return router.push({ name: 'scan-url' })
}
</script>

<style scoped>
.file-scn {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.par-1 {
  font-size: 26px;
}
.no-file-grp {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.yes-file-grp {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
button,
.upload-btn > label {
  width: 240px;
}
.upload-btn {
  position: relative;
}
.upload-btn > label {
  display: block;
}
#scanfile {
  z-index: -1;
  position: absolute;
  display: flex;
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
