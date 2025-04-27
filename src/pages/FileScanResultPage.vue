<template>
  <div class="file-scn-res" v-touch-swipe.mouse.horizontal="handleSwipe">
    <div class="res-back" @click="router.push({ name: 'scan-file' })">
      <i class="fa-solid fa-caret-left"></i>
      <p>Go back</p>
    </div>

    <div class="res-meta">
      <p class="res-meta-title">File scan report</p>
      <p class="res-meta-descriptor">
        {{ report?.meta?.fileName || '' }} ({{ report?.meta?.fileSizeStr || '' }})
      </p>
      <p class="res-meta-date">{{ report?.attributes?.date?.toLocaleDateString() || '' }}</p>
    </div>

    <div class="res-review" v-if="report">
      <div class="res-review-total">
        <div class="res-review-total-head">
          <StatusCircle :status="report.meta.outcome" />
          <p>{{ report.meta.outcome.grade }}</p>
        </div>
        <p class="res-review-total-line">{{ report.meta.outcome.hint }}</p>
      </div>
      <div class="res-review-total-groups" @touchstart.stop @mousedown.stop>
        <div
          class="res-review-total-group"
          v-for="[stat, count] in totalResGroups"
          :key="stat.name"
        >
          <StatusCircle class="res-review-total-icon" size="BIG" :status="stat">
            <b>{{ count }}x</b>
          </StatusCircle>
          <p class="res-review-total-label">{{ stat.name }}</p>
        </div>
      </div>
    </div>

    <div class="res-details" v-if="report">
      <div
        class="res-detail"
        v-for="detail in detailReports"
        :key="`${detail.engine_name} ${detail.engine_version}`"
      >
        <div class="res-detail-head">
          <StatusCircle :status="detail.outcome" />
          <p class="res-detail-head-engname">{{ detail.engine_name }}</p>
          <p class="res-detail-head-engvers">v{{ detail.engine_version }}</p>
        </div>
        <p class="res-detail-outcome">{{ detail.result }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref, computed, onMounted } from 'vue'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

import StatusCircle from 'src/components/StatusCircle.vue'

import { prepareDataSetFile } from 'src/scripts/StatusCodes'

const router = useRouter()
const route = useRoute()

const reports = ref([])
const report = ref(null)

const totalResGroups = computed(() => {
  return report.value.attributes.stats.entries() || []
})

const detailReports = computed(() => {
  return Object.values(report.value.attributes.results) || []
})

const handleSwipe = ({ ...event }) => {
  if (event.direction === 'right') return router.push({ name: 'scan-file' })
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

onMounted(async () => {
  const dataSet = await readDataSet()
  reports.value = prepareDataSetFile(dataSet)
  report.value = reports.value.find((rep) => rep.id === route.params.id) || null

  if (report.value === null) router.push({ name: 'scan-file' })
})
</script>

<style scoped>
.file-scn-res {
  display: flex;
  flex-direction: column;
  gap: 40px;
}
.res-back {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  cursor: pointer;
}
.res-back > i {
  font-size: 20px;
}
.res-back > p {
  font-size: 18px;
}

.res-meta {
}
.res-meta-title {
  font-size: 26px;
}
.res-meta-descriptor {
  font-size: 18px;
}
.res-meta-date {
  color: #bdbdbd;
}

.res-review {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.res-review-total {
}
.res-review-total-head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.res-review-total-head > p {
}
.res-review-total-line {
  font-size: 14px;
}
.res-review-total-groups {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 18px;
  overflow-x: auto;
}
.res-review-total-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.res-review-total-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
.res-review-total-icon > b {
  font-size: 14px;
  color: white;
}
.res-review-total-label {
}

.res-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.res-detail-head {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 12px;
}
.res-detail-head-engname {
  flex: 1 1 auto;
  font-size: 17px;
}
.res-detail-head-engvers {
  flex: 0 1 auto;
  font-size: 14px;
  color: #bdbdbd;
}
.res-detail-outcome {
  font-size: 15px;
}
</style>
