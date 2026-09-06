import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const reminderId = 'proyecto3x-daily-study';
export async function configureReminder(enabled: boolean, hour = 20) {
  if (Platform.OS === 'web') return { enabled: false, message: 'Los recordatorios están disponibles en la app Android/iOS.' };
  if (!enabled) {
    await Notifications.cancelScheduledNotificationAsync(reminderId);
    return { enabled: false, message: 'Recordatorio desactivado.' };
  }
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('study', { name: 'Recordatorios de estudio', importance: Notifications.AndroidImportance.DEFAULT });
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return { enabled: false, message: 'No se concedió el permiso. Puedes activarlo después desde Ajustes.' };
  await Notifications.cancelScheduledNotificationAsync(reminderId);
  await Notifications.scheduleNotificationAsync({ identifier: reminderId,
    content: { title: 'Un paso más hacia tu licencia', body: 'Tu práctica de hoy te espera en Proyecto 3X.', data: { route: '/tests' } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute: 0, channelId: 'study' },
  });
  return { enabled: true, message: `Recordatorio diario a las ${hour}:00, hora de tu dispositivo.` };
}
