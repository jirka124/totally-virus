import { boot } from 'quasar/wrappers'
import { SafeArea } from 'capacitor-plugin-safe-area'

export default boot(async () => {
  try {
    const { insets } = await SafeArea.getSafeAreaInsets()

    for (const [key, value] of Object.entries(insets)) {
      document.documentElement.style.setProperty(`--safe-area-inset-${key}`, `${value}px`)
    }

    await SafeArea.removeAllListeners()

    SafeArea.addListener('safeAreaChanged', (data) => {
      const { insets: newInsets } = data
      for (const [key, value] of Object.entries(newInsets)) {
        document.documentElement.style.setProperty(`--safe-area-inset-${key}`, `${value}px`)
      }
    })
  } catch (err) {
    console.error('SafeArea plugin error:', err)
  }
})
