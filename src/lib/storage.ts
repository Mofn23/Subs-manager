"use client";

import { SubscriptionItem } from "./financials";

const STORAGE_KEYS = {
  SUBSCRIPTIONS: "subs_manager_subscriptions_v1",
  USER_PREFS: "subs_manager_user_prefs_v1",
  NOTIFICATIONS: "subs_manager_notifications_v1",
};

export interface UserPrefs {
  name: string;
  email: string;
  currency: string;
  monthlyBudget: number;
  onboarded: boolean;
  theme: "dark" | "light" | "system";
}

const DEFAULT_USER_PREFS: UserPrefs = {
  name: "Usuario",
  email: "usuario@subsmanager.app",
  currency: "COP",
  monthlyBudget: 350000,
  onboarded: true,
  theme: "dark",
};

const INITIAL_SEED_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: "sub_1",
    userId: "local_user",
    name: "Datos mama",
    provider: "Movistar",
    category: "Productivity",
    price: 35000,
    billingCycle: "MONTHLY",
    customIntervalMonths: 1,
    nextRenewalDate: new Date(Date.now() + 1000 * 60 * 60 * 2), // Today
    trialEndDate: null,
    autoRenew: true,
    status: "ACTIVE",
    notes: "Plan móvil familiar",
    icon: "📱",
    cancelUrl: "https://www.movistar.co",
    cancelSteps: "Llamar al servicio al cliente o ingresar a Mi Movistar",
    reminderDays: 3,
    flaggedLowUsage: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub_2",
    userId: "local_user",
    name: "Apple Music",
    provider: "Apple",
    category: "Streaming",
    price: 8500,
    billingCycle: "MONTHLY",
    customIntervalMonths: 1,
    nextRenewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24), // In 1 day
    trialEndDate: null,
    autoRenew: true,
    status: "ACTIVE",
    notes: "Música en alta definición",
    icon: "🎵",
    cancelUrl: "https://support.apple.com/subscriptions",
    cancelSteps: "Ajustes de iOS -> Apple ID -> Suscripciones",
    reminderDays: 3,
    flaggedLowUsage: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub_3",
    userId: "local_user",
    name: "iCloud+",
    provider: "Apple",
    category: "Utilities",
    price: 44900,
    billingCycle: "MONTHLY",
    customIntervalMonths: 1,
    nextRenewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // In 5 days
    trialEndDate: null,
    autoRenew: true,
    status: "ACTIVE",
    notes: "200GB almacenamiento familiar",
    icon: "☁️",
    cancelUrl: "https://support.apple.com/subscriptions",
    cancelSteps: "Ajustes de iOS -> iCloud -> Gestionar almacenamiento",
    reminderDays: 3,
    flaggedLowUsage: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub_4",
    userId: "local_user",
    name: "Netflix Premium",
    provider: "Netflix",
    category: "Streaming",
    price: 44900,
    billingCycle: "MONTHLY",
    customIntervalMonths: 1,
    nextRenewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12), // In 12 days
    trialEndDate: null,
    autoRenew: true,
    status: "ACTIVE",
    notes: "Plan 4K UHD",
    icon: "🍿",
    cancelUrl: "https://www.netflix.com/youraccount",
    cancelSteps: "Cuenta -> Cancelar membresía",
    reminderDays: 3,
    flaggedLowUsage: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "sub_5",
    userId: "local_user",
    name: "ChatGPT Plus",
    provider: "OpenAI",
    category: "AI & Tech",
    price: 84000,
    billingCycle: "MONTHLY",
    customIntervalMonths: 1,
    nextRenewalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18), // In 18 days
    trialEndDate: null,
    autoRenew: true,
    status: "ACTIVE",
    notes: "Acceso GPT-4o",
    icon: "🤖",
    cancelUrl: "https://chatgpt.com",
    cancelSteps: "My Account -> Manage Subscription",
    reminderDays: 3,
    flaggedLowUsage: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Helper to check if window is available
function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// User Prefs
export function getLocalUserPrefs(): UserPrefs {
  if (!isBrowser()) return DEFAULT_USER_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PREFS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify(DEFAULT_USER_PREFS));
      return DEFAULT_USER_PREFS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_USER_PREFS;
  }
}

export function saveLocalUserPrefs(prefs: Partial<UserPrefs>): UserPrefs {
  if (!isBrowser()) return DEFAULT_USER_PREFS;
  const current = getLocalUserPrefs();
  const updated = { ...current, ...prefs };
  localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify(updated));
  return updated;
}

// Subscriptions
export function getLocalSubscriptions(): SubscriptionItem[] {
  if (!isBrowser()) return INITIAL_SEED_SUBSCRIPTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(INITIAL_SEED_SUBSCRIPTIONS));
      return INITIAL_SEED_SUBSCRIPTIONS;
    }
    const items = JSON.parse(raw);
    return items.map((item: any) => ({
      ...item,
      nextRenewalDate: new Date(item.nextRenewalDate),
      trialEndDate: item.trialEndDate ? new Date(item.trialEndDate) : null,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
    }));
  } catch (e) {
    return INITIAL_SEED_SUBSCRIPTIONS;
  }
}

export function saveLocalSubscription(data: any): SubscriptionItem {
  const current = getLocalSubscriptions();
  const isEdit = !!data.id;
  const id = isEdit ? data.id : `sub_${Date.now()}`;

  const newItem: SubscriptionItem = {
    id,
    userId: "local_user",
    name: data.name,
    provider: data.provider,
    category: data.category || "Other",
    price: parseFloat(data.price),
    billingCycle: data.billingCycle || "MONTHLY",
    customIntervalMonths: data.customIntervalMonths ? parseInt(data.customIntervalMonths) : 1,
    nextRenewalDate: new Date(data.nextRenewalDate),
    trialEndDate: data.trialEndDate ? new Date(data.trialEndDate) : null,
    autoRenew: data.autoRenew ?? true,
    status: data.status || "ACTIVE",
    notes: data.notes || "",
    icon: data.icon || "📦",
    cancelUrl: data.cancelUrl || "",
    cancelSteps: data.cancelSteps || "",
    reminderDays: data.reminderDays ? parseInt(data.reminderDays) : 3,
    flaggedLowUsage: data.flaggedLowUsage ?? false,
    createdAt: isEdit ? data.createdAt || new Date() : new Date(),
    updatedAt: new Date(),
  };

  let updatedList: SubscriptionItem[];
  if (isEdit) {
    updatedList = current.map((item) => (item.id === id ? newItem : item));
  } else {
    updatedList = [newItem, ...current];
  }

  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updatedList));
  }
  return newItem;
}

export function deleteLocalSubscription(id: string): void {
  if (!isBrowser()) return;
  const current = getLocalSubscriptions();
  const updatedList = current.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updatedList));
}

export function toggleLocalLowUsage(id: string, flagged: boolean): SubscriptionItem[] {
  if (!isBrowser()) return [];
  const current = getLocalSubscriptions();
  const updatedList = current.map((item) =>
    item.id === id ? { ...item, flaggedLowUsage: flagged, updatedAt: new Date() } : item
  );
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updatedList));
  return updatedList;
}

export function updateLocalSubscriptionStatus(id: string, status: string): SubscriptionItem[] {
  if (!isBrowser()) return [];
  const current = getLocalSubscriptions();
  const updatedList = current.map((item) =>
    item.id === id ? { ...item, status: status as any, updatedAt: new Date() } : item
  );
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updatedList));
  return updatedList;
}

export function markLocalSubscriptionAsPaid(id: string): SubscriptionItem[] {
  if (!isBrowser()) return [];
  const current = getLocalSubscriptions();
  const item = current.find((s) => s.id === id);
  if (!item) return current;

  const currentDate = new Date();
  const baseDate = item.nextRenewalDate < currentDate ? currentDate : new Date(item.nextRenewalDate);
  const nextDate = new Date(baseDate);

  switch (item.billingCycle) {
    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "BIWEEKLY":
      nextDate.setDate(nextDate.getDate() + 14);
      break;
    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "QUARTERLY":
      nextDate.setMonth(nextDate.getMonth() + 3);
      break;
    case "SEMESTRIAL":
      nextDate.setMonth(nextDate.getMonth() + 6);
      break;
    case "YEARLY":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
    case "CUSTOM":
      nextDate.setMonth(nextDate.getMonth() + (item.customIntervalMonths || 1));
      break;
    default:
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
  }

  const updatedList = current.map((s) =>
    s.id === id ? { ...s, nextRenewalDate: nextDate, updatedAt: new Date() } : s
  );

  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(updatedList));
  return updatedList;
}
