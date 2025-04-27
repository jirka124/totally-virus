import { defineBoot } from '#q-app/wrappers'
import { LocalNotifications } from '@capacitor/local-notifications'

export default defineBoot(async () => {
  await LocalNotifications.requestPermissions()
})
