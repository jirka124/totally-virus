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
import { ref, computed, onMounted } from 'vue'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { LocalNotifications } from '@capacitor/local-notifications'

import StatusCircle from 'src/components/StatusCircle.vue'

import { prepareDataSetURL } from 'src/scripts/StatusCodes'
import { scanUrl, getReport } from 'src/services/virusTotal'

const progressIndex = ref(0)
const urlVal = defineModel()
const router = useRouter()
let reports = ref([])

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
  const DELAY_MS = 10000

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

const scanUrlFunc = async () => {
  if (!urlVal.value) return
  let report = null

  try {
    const scanResult = await scanUrl(urlVal.value)
    const scanId = scanResult.data.id

    report = (await waitForCompletion(scanId)).data
    report.meta = {}
    report.meta.URL = urlVal.value
  } catch (e) {
    console.error(e)
  }

  return report
}

const performURLScan = async () => {
  progressIndex.value = 1

  const newEntry = await scanUrlFunc()
  if (newEntry === null) return (progressIndex.value = 3)

  await writeDataSet(newEntry)
  await sendNotify(newEntry.meta.URL)
  progressIndex.value = 2
}

const handleNextStep = async () => {
  if (progressIndex.value === 0) await performURLScan()
  if (progressIndex.value === 2 || progressIndex.value === 3) progressIndex.value = 0
}

const handleSwipe = ({ ...event }) => {
  if (event.direction === 'right') return router.push({ name: 'scan-file' })
}

const writeDataSet = async (newEntry) => {
  const currentDataSet = await readDataSet()
  let newDataSet = JSON.parse(currentDataSet)

  try {
    newDataSet.unshift(newEntry)

    await Filesystem.writeFile({
      path: 'history/url-history.json',
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
        path: 'history/url-history.json',
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
  reports.value = prepareDataSetURL(dataSet)
}

onMounted(async () => {
  await syncUpHistory()
})
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
