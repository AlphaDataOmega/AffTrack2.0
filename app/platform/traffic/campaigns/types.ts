import { z } from 'zod'

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED'
}

export enum DestinationType {
  SINGLE = 'single',
  SPLIT_TEST = 'split_test'
}

export enum DistributionType {
  EVEN = 'even',
  WEIGHTED = 'weighted',
  RULES = 'rules'
}

export enum CampaignType {
  CPC = 'cpc',
  CPA = 'cpa',
  REVSHARE = 'revshare'
}

// Activity types following project standards
export const CampaignActivityTypes = {
  CREATE: '[CAMPAIGNS] CREATE',
  UPDATE: '[CAMPAIGNS] UPDATE',
  DELETE: '[CAMPAIGNS] DELETE',
  ERROR: '[CAMPAIGNS] ERROR'
} as const

// Define ruleSchema first
const ruleSchema = z.object({
  id: z.string().optional(),
  field: z.string().min(1, 'Field is required'),
  operator: z.string().min(1, 'Operator is required'),
  value: z.string().min(1, 'Value is required')
})

const destinationSchema = z.object({
  id: z.string().optional(),
  url: z.string().url('Please enter a valid URL'),
  name: z.string().min(1, 'Name is required'),
  weight: z.number().min(0).max(100).optional(),
  isDefault: z.boolean().optional().default(false),
  rules: z.array(ruleSchema).optional().default([]),
  clicks: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).optional().default(0),
  conversions: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).optional().default(0),
  revenue: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).optional().default(0),
  ctr: z.union([z.number(), z.string(), z.null()]).transform(val => val === null ? 0 : Number(val) || 0).optional(),
  cr: z.union([z.number(), z.string(), z.null()]).transform(val => val === null ? 0 : Number(val) || 0).optional(),
  epc: z.union([z.number(), z.string(), z.null()]).transform(val => val === null ? 0 : Number(val) || 0).optional(),
  rpc: z.union([z.number(), z.string(), z.null()]).transform(val => val === null ? 0 : Number(val) || 0).optional(),
  testStartedAt: z.date().optional(),
  testEndedAt: z.date().optional()
})

export const campaignFormSchema = z.object({
  basic: z.object({
    propertyIds: z.array(z.string()).min(1, 'At least one property is required'),
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().default(''),
    type: z.string().min(1, 'Type is required'),
    sourceType: z.string().min(1, 'Source type is required'),
    affiliateId: z.string().nullable().optional(),
    adNetworkId: z.string().nullable().optional(),
    status: z.nativeEnum(CampaignStatus, {
      required_error: 'Campaign status is required',
      invalid_type_error: 'Please select a valid campaign status'
    })
  }).refine(
    (data) => {
      if (data.sourceType === 'affiliate') {
        return data.affiliateId != null;
      }
      if (data.sourceType === 'adnetwork') {
        return data.adNetworkId != null;
      }
      return true;
    },
    {
      message: "Must select an affiliate when source type is 'affiliate', or an ad network when source type is 'adnetwork'",
      path: ['sourceType']
    }
  ),
  tracking: z.object({
    utmSource: z.string().min(1, 'UTM source is required'),
    utmMedium: z.string().min(1, 'UTM medium is required'),
    utmCampaign: z.string().min(1, 'UTM campaign is required'),
    utmContent: z.string().optional(),
    utmTerm: z.string().optional()
  }),
  targeting: z.object({
    countries: z.array(z.string()).min(1, 'At least one country is required'),
    devices: z.array(z.string()).min(1, 'At least one device is required'),
    browsers: z.array(z.string()).min(1, 'At least one browser is required'),
    languages: z.array(z.string()).min(1, 'At least one language is required')
  }),
  destinations: z.object({
    destinationType: z.nativeEnum(DestinationType),
    distribution: z.nativeEnum(DistributionType),
    destinations: z.array(destinationSchema).min(1, 'At least one destination is required'),
    rules: z.array(ruleSchema).optional()
  }),
  budget: z.object({
    campaignType: z.nativeEnum(CampaignType),
    bidAmount: z.number().nullable().optional(),
    targetCpa: z.number().nullable().optional(),
    revshareRate: z.number().nullable().optional(),
    daily: z.number().nullable(),
    total: z.number().nullable(),
    dailyUnlimited: z.boolean(),
    totalUnlimited: z.boolean()
  }).refine(
    (data) => {
      switch (data.campaignType) {
        case CampaignType.CPC:
          return data.bidAmount != null && data.bidAmount > 0;
        case CampaignType.CPA:
          return data.targetCpa != null && data.targetCpa > 0;
        case CampaignType.REVSHARE:
          return data.revshareRate != null && data.revshareRate > 0 && data.revshareRate <= 100;
        default:
          return true;
      }
    },
    {
      message: (data) => {
        switch (data.campaignType) {
          case CampaignType.CPC:
            return "Bid amount is required and must be greater than 0 for CPC campaigns";
          case CampaignType.CPA:
            return "Target CPA is required and must be greater than 0 for CPA campaigns";
          case CampaignType.REVSHARE:
            return "Revenue share rate is required and must be between 0 and 100 for Revenue Share campaigns";
          default:
            return "Invalid campaign type";
        }
      },
      path: ["campaignType"]
    }
  )
})

export type CampaignForm = z.infer<typeof campaignFormSchema>

export type StepProps = {
  form: CampaignForm
  setForm: (form: CampaignForm) => void
}

export type Property = {
  id: string
  name: string
  domain?: string
}

export type Destination = {
  id?: string;
  url: string;
  name: string;
  weight?: number;
  isDefault?: boolean;
  rules?: Rule[];
  clicks?: number;
  conversions?: number;
  revenue?: number;
  ctr?: number;
  cr?: number;
  epc?: number;
  rpc?: number;
  testStartedAt?: Date;
  testEndedAt?: Date;
}

export type Rule = {
  id?: string;
  field: string;
  operator: string;
  value: string;
}

export const DEFAULT_FORM_VALUES: CampaignForm = {
  basic: {
    propertyIds: [],
    name: '',
    description: '',
    type: '',
    sourceType: '',
    affiliateId: null,
    adNetworkId: null,
    status: CampaignStatus.DRAFT
  },
  tracking: {
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmContent: '',
    utmTerm: ''
  },
  targeting: {
    countries: [],
    devices: [],
    browsers: [],
    languages: []
  },
  destinations: {
    destinationType: DestinationType.SINGLE,
    distribution: DistributionType.EVEN,
    destinations: [],
    rules: []
  },
  budget: {
    campaignType: CampaignType.CPC,
    bidAmount: undefined,
    targetCpa: undefined,
    revshareRate: undefined,
    daily: null,
    total: null,
    dailyUnlimited: true,
    totalUnlimited: true
  }
} 