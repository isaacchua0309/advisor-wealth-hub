export interface Policy {
  id: string;
  client_id: string;
  user_id: string;
  policy_name: string;
  policy_type: string;
  policy_number: string | null;
  provider: string | null;
  premium: number | null;
  value: number | null;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  payment_structure_type: 'single_premium' | 'one_year_term' | 'regular_premium' | 'five_year_premium' | 'ten_year_premium' | 'lifetime_premium';
  commission_rate: number | null;
  first_year_commission: number | null;
  annual_ongoing_commission: number | null;
  policy_duration: number | null;
  global_policy_id: string | null;
  sum_invested: number | null;
  ongoing_commission_rate: number | null;
  commission_duration: number | null;
  global_policies?: GlobalPolicy | null;
}

export interface GlobalPolicy {
  id: string;
  user_id: string;
  policy_name: string;
  policy_type: string;
  provider: string | null;
  first_year_commission_rate: number | null;
  ongoing_commission_rate: number | null;
  commission_duration: number | null;
  policy_duration: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  payment_structure_type?: string;
}

export interface CreatePolicyInput {
  policy_name: string;
  policy_type: string;
  policy_number?: string | null;
  provider?: string | null;
  premium?: number | null;
  value?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  payment_structure_type: Policy['payment_structure_type'];
  commission_rate?: number | null;
  first_year_commission?: number | null;
  annual_ongoing_commission?: number | null;
  policy_duration?: number | null;
  global_policy_id?: string | null;
  sum_invested?: number | null;
  ongoing_commission_rate?: number | null;
  commission_duration?: number | null;
}

export interface CreateGlobalPolicyInput {
  policy_name: string;
  policy_type: string;
  provider?: string | null;
  first_year_commission_rate?: number | null;
  ongoing_commission_rate?: number | null;
  commission_duration?: number | null;
  policy_duration?: number | null;
  status?: string;
  payment_structure_type: Policy['payment_structure_type'];
}

import { differenceInYears } from 'date-fns';

export const calculateOngoingCommission = (
  totalCommission: number,
  firstYearCommission: number,
  paymentStructureType: Policy['payment_structure_type']
): number => {
  const remainingCommission = totalCommission - firstYearCommission;

  switch (paymentStructureType) {
    case 'single_premium':
    case 'one_year_term':
      return 0;
    case 'regular_premium':
      return remainingCommission / 5;
    case 'five_year_premium':
      return remainingCommission / 4;
    case 'ten_year_premium':
    case 'lifetime_premium':
      return remainingCommission / 5;
    default:
      return 0;
  }
};

export const calculatePolicyDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const years = differenceInYears(end, start);
  return Math.max(1, Math.min(30, years));
};

export const validatePolicyLimits = (value: number, type: 'premium' | 'value', policyType: string): boolean => {
  const limits = {
    life: { maxPremium: 1000000, maxValue: 10000000 },
    health: { maxPremium: 50000, maxValue: 1000000 },
    auto: { maxPremium: 10000, maxValue: 500000 },
    home: { maxPremium: 20000, maxValue: 2000000 },
    disability: { maxPremium: 30000, maxValue: 1000000 },
    liability: { maxPremium: 50000, maxValue: 5000000 },
    business: { maxPremium: 500000, maxValue: 10000000 },
    other: { maxPremium: 100000, maxValue: 1000000 }
  };

  if (!limits[policyType as keyof typeof limits]) return true;
  const limit = type === 'premium' 
    ? limits[policyType as keyof typeof limits].maxPremium 
    : limits[policyType as keyof typeof limits].maxValue;
  
  return value <= limit;
};
