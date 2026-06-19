// lib/businessRegistry.ts
import { BusinessProfile } from './storeData'; // Assuming BusinessProfile is defined and exported here

const BUSINESS_REGISTRY_KEY = 'scancode.businessRegistry';

export const getAllBusinessProfiles = (): BusinessProfile[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(BUSINESS_REGISTRY_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error parsing business registry from localStorage", e);
    return [];
  }
};

export const saveAllBusinessProfiles = (profiles: BusinessProfile[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(BUSINESS_REGISTRY_KEY, JSON.stringify(profiles));
  }
};

export const getBusinessProfileById = (id: string): BusinessProfile | undefined => {
  const allProfiles = getAllBusinessProfiles();
  return allProfiles.find(profile => profile.id === id);
};