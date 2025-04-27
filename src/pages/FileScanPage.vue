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
import { ref, computed, onMounted } from 'vue'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { LocalNotifications } from '@capacitor/local-notifications'

import StatusCircle from 'src/components/StatusCircle.vue'

import { prepareDataSetFile, resolveFileSize } from 'src/scripts/StatusCodes'
import { scanFile, getReport } from 'src/services/virusTotal'

const progressIndex = ref(0)
const uploadedFile = ref(null)
const router = useRouter()

let reports = ref([])

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

const sendNotify = async (scanIdentifier) => {
  await LocalNotifications.schedule({
    notifications: [
      {
        title: 'Totally Virus ready',
        body: `Scanning of "${scanIdentifier}" done`,
        id: Math.floor(Math.random() * 100000),
        schedule: { at: new Date(Date.now() + 100) },
      },
    ],
  })
}

const waitForCompletion = async (scanId) => {
  const MAX_RETRIES = 10
  const DELAY_MS = 20000

  let attempt = 0

  while (attempt < MAX_RETRIES) {
    try {
      const report = await getReport(scanId)
      if (report.data.attributes.status === 'completed') return report
    } catch (e) {
      console.error(e)
    }

    await new Promise((res) => setTimeout(res, DELAY_MS))
    attempt++
  }

  throw new Error('MAX try cap reached')
}

const scanFileFunc = async () => {
  if (!uploadedFile.value) return
  let report = null

  try {
    const scanResult = await scanFile(uploadedFile.value)
    const scanId = scanResult.data.id

    report = (await waitForCompletion(scanId)).data
    report.meta = {}
    report.meta.fileName = uploadedFile.value.name
    report.meta.fileSizeB = uploadedFile.value.size
  } catch (e) {
    console.error(e)
  }

  return report
}

const performFileScan = async () => {
  progressIndex.value = 2

  const newEntry = await scanFileFunc()
  if (newEntry === null) return (progressIndex.value = 4)

  await writeDataSet(newEntry)
  await sendNotify(newEntry.meta.fileName)
  progressIndex.value = 3
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return (progressIndex.value = 0)

  progressIndex.value = 1
  uploadedFile.value = file
}

const handleNextStep = async () => {
  if (progressIndex.value === 1) await performFileScan()
  if (progressIndex.value === 3 || progressIndex.value === 4) progressIndex.value = 0
}

const handleSwipe = ({ ...event }) => {
  if (event.direction === 'right') return router.push({ name: 'index' })
  if (event.direction === 'left') return router.push({ name: 'scan-url' })
}

const writeDataSet = async (newEntry) => {
  const currentDataSet = await readDataSet()
  let newDataSet = JSON.parse(currentDataSet)

  try {
    newDataSet.unshift(newEntry)

    await Filesystem.writeFile({
      path: 'history/file-history.json',
      data: JSON.stringify(newDataSet),
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      recursive: true,
    })

    await syncUpHistory()
  } catch (e) {
    console.error(e)
  }
}

const readDataSet = async () => {
  let contents = '[]'
  try {
    contents = (
      await Filesystem.readFile({
        path: 'history/file-history.json',
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      })
    ).data
  } catch (e) {
    console.error(e)
  }

  return contents
}

const syncUpHistory = async () => {
  const dataSet = await readDataSet()
  reports.value = prepareDataSetFile(dataSet)
}

onMounted(async () => {
  await syncUpHistory()
})
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
  align-items: center;
  gap: 10px;
}
.yes-file-grp {
  display: flex;
  flex-direction: column;
  align-items: center;
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
