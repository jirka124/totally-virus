export const RECOGNIZED_STATUSES = Object.freeze({
  FAIL: {
    name: 'fail',
    hex: '#000000',
    grade: 'Fail Grade',
    hint: 'Something went wrong in there!',
  },
  SAFE: { name: 'safe', hex: '#25AD09', grade: 'Safe Grade', hint: 'Feel free to use the file!' },
  DANGEROUS: {
    name: 'dangerous',
    hex: '#E30505',
    grade: 'Dangerous Grade',
    hint: 'Better keep your hands off it!',
  },
  SUSPICIOUS: {
    name: 'suspicious',
    hex: '#FFCE53',
    grade: 'Suspicious Grade',
    hint: 'Something is fishy in here!',
  },
  OTHER: {
    name: 'other',
    hex: '#CBCBCB',
    grade: 'Other Grade',
    hint: 'Lack of data to assess danger!',
  },
})

export const resolveStatusFile = (status) => {
  if (status === 'failure') return RECOGNIZED_STATUSES.FAIL
  if (status === 'harmless') return RECOGNIZED_STATUSES.SAFE
  if (status === 'malicious') return RECOGNIZED_STATUSES.DANGEROUS
  if (status === 'suspicious') return RECOGNIZED_STATUSES.SUSPICIOUS

  return RECOGNIZED_STATUSES.OTHER
}

export const resolveStatusURL = (status) => {
  if (status === 'harmless') return RECOGNIZED_STATUSES.SAFE
  if (status === 'malicious') return RECOGNIZED_STATUSES.DANGEROUS
  if (status === 'suspicious') return RECOGNIZED_STATUSES.SUSPICIOUS

  return RECOGNIZED_STATUSES.OTHER
}

export const normalizeStatsFile = (stats) => {
  const out = new Map()
  Object.values(RECOGNIZED_STATUSES).map((val) => {
    out.set(val, 0)
  })

  for (const [statStatus, statCount] of Object.entries(stats)) {
    const normalizedStatus = resolveStatusFile(statStatus)
    if (out.has(normalizedStatus)) {
      out.set(normalizedStatus, out.get(normalizedStatus) + statCount)
    }
  }

  return out
}

export const normalizeStatsURL = (stats) => {
  const out = new Map()
  Object.values(RECOGNIZED_STATUSES).map((val) => {
    out.set(val, 0)
  })

  for (const [statStatus, statCount] of Object.entries(stats)) {
    const normalizedStatus = resolveStatusURL(statStatus)
    if (out.has(normalizedStatus)) {
      out.set(normalizedStatus, out.get(normalizedStatus) + statCount)
    }
  }

  return out
}

export const resolveTotalCoutcome = (stats) => {
  if (stats.has(RECOGNIZED_STATUSES.DANGEROUS) && stats.get(RECOGNIZED_STATUSES.DANGEROUS) > 0)
    return RECOGNIZED_STATUSES.DANGEROUS

  if (stats.has(RECOGNIZED_STATUSES.SUSPICIOUS) && stats.get(RECOGNIZED_STATUSES.SUSPICIOUS) > 0)
    return RECOGNIZED_STATUSES.SUSPICIOUS

  if (stats.has(RECOGNIZED_STATUSES.FAIL) && stats.get(RECOGNIZED_STATUSES.FAIL) > 0)
    return RECOGNIZED_STATUSES.FAIL

  if (stats.has(RECOGNIZED_STATUSES.SAFE) && stats.get(RECOGNIZED_STATUSES.SAFE) > 0)
    return RECOGNIZED_STATUSES.SAFE

  return RECOGNIZED_STATUSES.OTHER
}

export const resolveFileSize = (bytes) => {
  if (bytes < 1e3) return `${bytes} B`
  if (bytes >= 1e3 && bytes < 1e6) return `${(bytes / 1e3).toFixed(1)} KB`
  if (bytes >= 1e6 && bytes < 1e9) return `${(bytes / 1e6).toFixed(1)} MB`

  return `${(bytes / 1e9).toFixed(1)} GB`
}

export const prepareDataSetFile = (jsonStr) => {
  let results = []
  try {
    results = JSON.parse(jsonStr)
  } catch (e) {
    console.error(e)
  }

  results.map((res) => {
    res.attributes.date = new Date(res.attributes.date * 1000)
    Object.values(res.attributes.results).map((res1) => {
      res1.outcome = resolveStatusFile(res1.category)
    })
    res.attributes.stats = normalizeStatsFile(res.attributes.stats)
    res.meta.outcome = resolveTotalCoutcome(res.attributes.stats)
    res.meta.fileSizeStr = resolveFileSize(res.meta.fileSizeB)
  })

  return results
}

export const prepareDataSetURL = (jsonStr) => {
  let results = []
  try {
    results = JSON.parse(jsonStr)
  } catch (e) {
    console.error(e)
  }

  results.map((res) => {
    res.attributes.date = new Date(res.attributes.date * 1000)
    Object.values(res.attributes.results).map((res1) => {
      res1.outcome = resolveStatusURL(res1.category)
    })
    res.attributes.stats = normalizeStatsURL(res.attributes.stats)
    res.meta.outcome = resolveTotalCoutcome(res.attributes.stats)
  })

  return results
}
