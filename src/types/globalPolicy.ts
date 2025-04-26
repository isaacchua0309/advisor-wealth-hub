
import { Policy } from './policy';

export interface GlobalPolicy {
  id: string;
  user_id: string;
  policy_name: string;
  policy_type: string;
  payment_structure_type: Policy['payment_structure_type'];
  commission_rate: number | null;  // Renamed from commission_rate to ongoing_commission_rate for clarity
  first_year_commission_rate: number | null;  // New field for first year commission rate
  policy_duration: number | null;
  provider: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGlobalPolicyInput {
  policy_name: string;
  policy_type: string;
  payment_structure_type: Policy['payment_structure_type'];
  commission_rate?: number | null;  // Renamed from commission_rate to ongoing_commission_rate
  first_year_commission_rate?: number | null;  // New field
  policy_duration?: number | null;
  provider?: string | null;
  status?: string | null;
}

// Helper function to create a policy from a global policy
export const createPolicyFromGlobal = (globalPolicy: GlobalPolicy, clientId: string): Partial<Policy> => {
  return {
    client_id: clientId,
    policy_name: globalPolicy.policy_name,
    policy_type: globalPolicy.policy_type,
    payment_structure_type: globalPolicy.payment_structure_type,
    commission_rate: globalPolicy.commission_rate,
    first_year_commission_rate: globalPolicy.first_year_commission_rate,
    policy_duration: globalPolicy.policy_duration,
    provider: globalPolicy.provider,
    status: globalPolicy.status,
    global_policy_id: globalPolicy.id,
    
    // These fields will be specified when the policy is added to a client:
    premium: null,
    start_date: null,
    end_date: null,
    value: null,
    
    // First year commission will be calculated based on premium and first_year_commission_rate
    // when the policy is added to a client
    first_year_commission: null,
    annual_ongoing_commission: null
  };
};

// Helper function to calculate first year commission
export const calculateFirstYearCommission = (premium: number | null, firstYearRate: number | null): number | null => {
  if (premium === null || firstYearRate === null) {
    return null;
  }
  return premium * (firstYearRate / 100);
};

// Helper function to calculate ongoing commission based on payment structure
export const calculateOngoingCommission = (premium: number | null, ongoingRate: number | null, paymentStructureType: Policy['payment_structure_type']): number | null => {
  if (premium === null || ongoingRate === null) {
    return null;
  }

  const baseOngoingCommission = premium * (ongoingRate / 100);
  
  // Apply different calculations based on payment structure
  switch (paymentStructureType) {
    case 'single_premium':
    case 'one_year_term':
      return 0; // No ongoing commission for single premium or one-year policies
    case 'regular_premium':
      return baseOngoingCommission;
    case 'five_year_premium':
      return baseOngoingCommission;
    case 'ten_year_premium':
      return baseOngoingCommission;
    case 'lifetime_premium':
      return baseOngoingCommission;
    default:
      return 0;
  }
};
