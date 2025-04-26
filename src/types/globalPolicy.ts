
import { Policy } from './policy';

export interface GlobalPolicy {
  id: string;
  user_id: string;
  policy_name: string;
  policy_type: string;
  payment_structure_type: Policy['payment_structure_type'];
  premium: number | null;
  commission_rate: number | null;
  policy_duration: number | null;
  start_date: string | null;
  end_date: string | null;
  value: number | null;
  provider: string | null;
  status: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGlobalPolicyInput {
  policy_name: string;
  policy_type: string;
  payment_structure_type: Policy['payment_structure_type'];
  premium?: number | null;
  commission_rate?: number | null;
  policy_duration?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  value?: number | null;
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
    premium: globalPolicy.premium,
    commission_rate: globalPolicy.commission_rate,
    policy_duration: globalPolicy.policy_duration,
    start_date: globalPolicy.start_date,
    end_date: globalPolicy.end_date,
    value: globalPolicy.value,
    provider: globalPolicy.provider,
    status: globalPolicy.status,
    global_policy_id: globalPolicy.id,
    // First year commission will be calculated based on premium and commission rate
    first_year_commission: globalPolicy.premium && globalPolicy.commission_rate 
      ? globalPolicy.premium * (globalPolicy.commission_rate / 100) 
      : null,
    // Ongoing commission will be calculated in the component
    annual_ongoing_commission: null
  };
};
