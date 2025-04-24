
export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  occupation: string | null;
  age_group: string | null;
  created_at: string;
  updated_at: string;
  pipeline_stage: 'Lead' | 'Contacted' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
}

export interface CreateClientInput {
  name: string;
  email?: string;
  phone?: string;
  occupation?: string;
  age_group?: string;
  pipeline_stage?: 'Lead' | 'Contacted' | 'Proposal Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
}
