import type { AppMode } from "./getMode";

export type FeatureSet = {
  barcode: boolean;
  petCard: boolean;
  loyaltyCard: boolean;
  vetCard: boolean;
  vetHealth: boolean;
  appointments: boolean;
  vaccineSchedule: boolean;
  whatsappReminder: boolean;
  expiryAlerts: boolean;
  treatmentHistory: boolean;
};

export const features: Record<AppMode, FeatureSet> = {
  marine: {
    barcode: true,
    petCard: false,
    loyaltyCard: false,
    vetCard: false,
    vetHealth: false,
    appointments: false,
    vaccineSchedule: false,
    whatsappReminder: false,
    expiryAlerts: true,
    treatmentHistory: false,
  },
  stok: {
    barcode: true,
    petCard: false,
    loyaltyCard: false,
    vetCard: false,
    vetHealth: false,
    appointments: false,
    vaccineSchedule: false,
    whatsappReminder: false,
    expiryAlerts: false,
    treatmentHistory: false,
  },
  pet: {
    barcode: true,
    petCard: true,
    loyaltyCard: true,
    vetCard: false,
    vetHealth: false,
    appointments: false,
    vaccineSchedule: false,
    whatsappReminder: false,
    expiryAlerts: true,
    treatmentHistory: false,
  },
  vet: {
    barcode: false,
    petCard: false,
    loyaltyCard: false,
    vetCard: true,
    vetHealth: true,
    appointments: true,
    vaccineSchedule: true,
    whatsappReminder: true,
    expiryAlerts: false,
    treatmentHistory: true,
  },
};

export function hasFeature(mode: AppMode, feature: keyof FeatureSet): boolean {
  return features[mode][feature];
}
