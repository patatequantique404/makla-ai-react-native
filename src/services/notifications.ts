import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { t } from '../i18n';

const identifiers = ['makla.breakfast', 'makla.lunch', 'makla.dinner', 'makla.streak'];

export async function requestAndScheduleNotifications(): Promise<boolean> {
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;
  await scheduleDailyReminders();
  return true;
}

export async function scheduleDailyReminders(): Promise<void> {
  await Promise.all(identifiers.slice(0, 3).map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined)));
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('meal-reminders', {
      name: 'Meal reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const reminders = [
    { identifier: identifiers[0], hour: 9, title: 'Petit-déjeuner', body: 'Scanne ton petit-déjeuner pour suivre tes calories 🍳' },
    { identifier: identifiers[1], hour: 13, title: 'Déjeuner', body: "N'oublie pas de logger ton déjeuner 🥗" },
    { identifier: identifiers[2], hour: 20, title: 'Dîner', body: 'Ajoute ton dîner pour boucler ta journée 🍽️' },
  ];
  for (const reminder of reminders) {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.identifier,
      content: { title: t(reminder.title), body: t(reminder.body), sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: reminder.hour,
        minute: 0,
        channelId: Platform.OS === 'android' ? 'meal-reminders' : undefined,
      },
    });
  }
}

export async function refreshStreakReminder(hasLoggedToday: boolean): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifiers[3]).catch(() => undefined);
  if (hasLoggedToday) return;
  await Notifications.scheduleNotificationAsync({
    identifier: identifiers[3],
    content: {
      title: t('Garde ta série 🔥'),
      body: t("Logue au moins un repas aujourd'hui pour ne pas casser ta série."),
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: nextTime(21, 30),
      channelId: Platform.OS === 'android' ? 'meal-reminders' : undefined,
    },
  });
}

export async function cancelNotifications(): Promise<void> {
  await Promise.all(identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier).catch(() => undefined)));
}

function nextTime(hour: number, minute: number): Date {
  const result = new Date();
  result.setHours(hour, minute, 0, 0);
  if (result.getTime() <= Date.now()) result.setDate(result.getDate() + 1);
  return result;
}
