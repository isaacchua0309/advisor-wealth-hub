
export interface Policy {
  id: string;
  client_id: string;
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
}
