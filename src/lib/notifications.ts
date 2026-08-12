"use client";

import { LocalNotifications } from "@capacitor/local-notifications";
import { formatCurrency, SubscriptionItem } from "./financials";

function stringToHashId(str: string, offset: number): number {
  let hash = 0;
  const combined = `${str}_offset_${offset}`;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) - hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const check = await LocalNotifications.checkPermissions();
    if (check.display === "granted") return true;

    const req = await LocalNotifications.requestPermissions();
    return req.display === "granted";
  } catch (e) {
    console.warn("LocalNotifications not supported or available on this platform", e);
    return false;
  }
}

export async function scheduleSubscriptionNotifications(
  subscriptions: SubscriptionItem[],
  currency: string = "COP"
) {
  try {
    const perm = await requestNotificationPermissions();
    if (!perm) return;

    // Clear existing pending notifications before rescheduling
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({
        notifications: pending.notifications.map((n) => ({ id: n.id })),
      });
    }

    const now = new Date();
    const notificationsToSchedule: any[] = [];

    for (const sub of subscriptions) {
      if (
        sub.status === "CANCELLED" ||
        sub.status === "VERIFIED_CANCELLED" ||
        sub.status === "PAUSED"
      ) {
        continue;
      }

      const renewalDate = new Date(sub.nextRenewalDate);
      renewalDate.setHours(9, 0, 0, 0); // 9:00 AM local time

      const priceFormatted = formatCurrency(sub.price, currency);

      // 3 days before, 1 day before, and same day (0 days)
      const offsets = [
        {
          days: 3,
          title: `🔔 Renovación en 3 días: ${sub.name}`,
          body: `Tu suscripción de ${sub.name} (${priceFormatted}) vencerá en 3 días.`,
        },
        {
          days: 1,
          title: `⚠️ Renovación Mañana: ${sub.name}`,
          body: `Mañana se renovará tu suscripción de ${sub.name} (${priceFormatted}).`,
        },
        {
          days: 0,
          title: `💳 ¡Hoy renueva tu suscripción!: ${sub.name}`,
          body: `Hoy se cobra ${sub.name} (${priceFormatted}). Recuerda marcarla como pagada.`,
        },
      ];

      for (const item of offsets) {
        const notifDate = new Date(renewalDate);
        notifDate.setDate(notifDate.getDate() - item.days);

        if (notifDate > now) {
          notificationsToSchedule.push({
            id: stringToHashId(sub.id, item.days),
            title: item.title,
            body: item.body,
            schedule: { at: notifDate },
            sound: "beep.wav",
            actionTypeId: "",
            extra: {
              subscriptionId: sub.id,
              daysBefore: item.days,
            },
          });
        }
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      console.log(`Scheduled ${notificationsToSchedule.length} iOS native notifications.`);
    }
  } catch (err) {
    console.warn("Failed to schedule local notifications:", err);
  }
}

export async function sendTestNotification() {
  try {
    const perm = await requestNotificationPermissions();
    if (!perm) return { error: "Permiso de notificaciones denegado" };

    const notifId = Math.floor(Math.random() * 100000);
    await LocalNotifications.schedule({
      notifications: [
        {
          id: notifId,
          title: "🔔 Subs Manager Notificaciones Nativas",
          body: "¡Notificaciones activas! Te avisaremos 3 días antes, 1 día antes y el mismo día de cada cobro.",
          schedule: { at: new Date(Date.now() + 2000) }, // 2 seconds from now
          sound: "beep.wav",
        },
      ],
    });
    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "No se pudo enviar notificación de prueba" };
  }
}
