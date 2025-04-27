const API_URL = 'https://www.virustotal.com/api/v3'
const API_KEY = import.meta.env.TOTALLY_VIRUS_API_KEY

if (!API_KEY) {
  console.warn('VirusTotal API key is missing! Please set TOTALLY_VIRUS_API_KEY in your .env file.')
}

const headers = {
  'x-apikey': API_KEY,
}

export async function scanUrl(urlToScan) {
  const params = new URLSearchParams({ url: urlToScan })

  const response = await fetch(`${API_URL}/urls`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })

  if (!response.ok) {
    throw new Error(`VirusTotal scan URL failed: ${response.status}`)
  }

  const data = await response.json()
  return data
}

export async function scanFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_URL}/files`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`VirusTotal scan FILE failed: ${response.status}`)
  }

  const data = await response.json()
  return data
}

export async function getReport(scanId) {
  const response = await fetch(`${API_URL}/analyses/${scanId}`, {
    method: 'GET',
    headers,
  })

  if (!response.ok) {
    throw new Error(`VirusTotal report fetch failed: ${response.status}`)
  }

  const data = await response.json()
  return data
}

export default {
  scanUrl,
  getReport,
  scanFile,
}
