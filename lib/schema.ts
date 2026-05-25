import { z } from 'zod';

const businessHoursSchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
});

export const businessFormSchema = z.object({
  // A. Core Business Parameters
  practiceDisplayName: z.string().min(2, 'Practice name must be at least 2 characters'),
  corporateCleanName: z.string().min(2, 'Clean name must be at least 2 characters'),
  environmentStatus: z.enum(['internal_testing', 'live_production']),
  mongoOfficeId: z.string().readonly(),

  // B. EHR Mapping
  emailCompany: z.string().optional(),
  cpmid: z.string().min(1, 'CPMID is required'),
  syeLocationId: z.number().int().min(1, 'Must be a valid location ID'),
  vapiAssistantTemplateId: z.string().optional(),

  // C. Telephony
  inboundPhone: z.string().regex(/^\d{10}$/, 'Must be exactly 10 digits'),
  publicNumber: z
    .string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Must be a valid E.164 phone number (e.g. +12085527323)')
    .optional()
    .or(z.literal('')),
  // Auto-populated by the Twilio provisioning widget — never manually entered
  twilioSid: z.string().optional(),
  twilioSubAccountSid: z.string().optional(),
  carrierTrunkName: z.string().optional(),
  failoverRingCount: z.number().int().min(1).max(5),
  voipRoutingType: z.literal('sip'),

  // D. Localization & Hours
  timezone: z.string().min(1, 'Timezone is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  operationalHours: z.object({
    mondayFriday: businessHoursSchema,
    saturday: businessHoursSchema,
    sunday: businessHoursSchema,
  }),
  internalWorkingHours: z.string(),

  // E. Behavior Toggles
  recordingDisclosure: z.boolean(),
  allowSameDayBookings: z.boolean(),
  maxSlotSearchRounds: z.number().int().min(1).max(5),
  mandatoryEmailProfile: z.boolean(),
});

export type BusinessFormSchema = z.infer<typeof businessFormSchema>;
