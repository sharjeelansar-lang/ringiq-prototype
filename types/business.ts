export type EnvironmentStatus = 'internal_testing' | 'live_production';
export type VoipRoutingType = 'webhook' | 'sip';

export interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

export interface OperationalHours {
  mondayFriday: BusinessHours;
  saturday: BusinessHours;
  sunday: BusinessHours;
}

export interface BusinessFormData {
  // A. Core Business Parameters
  practiceDisplayName: string;
  corporateCleanName: string;
  environmentStatus: EnvironmentStatus;
  mongoOfficeId: string;

  // B. EHR Mapping
  emailCompany?: string;
  cpmid: string;
  syeLocationId: number;
  vapiAssistantTemplateId: string;

  // C. Telephony
  inboundPhone: string;
  publicNumber: string;
  twilioSid: string;
  carrierTrunkName: string;
  failoverRingCount: number;
  voipRoutingType: VoipRoutingType;

  // D. Localization & Hours
  timezone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  operationalHours: OperationalHours;
  internalWorkingHours: string;

  // E. Behavior Toggles
  recordingDisclosure: boolean;
  allowSameDayBookings: boolean;
  maxSlotSearchRounds: number;
  mandatoryEmailProfile: boolean;
}

export interface MockBusiness {
  id: string;
  practiceDisplayName: string;
  corporateCleanName: string;
  environmentStatus: EnvironmentStatus;
  mongoOfficeId: string;
  cpmid: string;
  timezone: string;
  createdAt: string;
  inboundPhone: string;
  twilioSid: string;
}
