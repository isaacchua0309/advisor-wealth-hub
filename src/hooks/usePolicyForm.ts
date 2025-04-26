
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CreatePolicyInput, Policy } from '@/types/policy';
import { differenceInYears } from 'date-fns';

// Redefine FormType to make it compatible with both CreatePolicyInput and Partial<Policy>
export type FormType = {
  policy_name: string;
  policy_type: string;
  payment_structure_type: Policy['payment_structure_type'];
  provider?: string | null;
  policy_number?: string | null;
  premium?: number | null;
  value?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  commission_rate?: number | null;
  first_year_commission?: number | null;
  annual_ongoing_commission?: number | null;
  policy_duration?: number | null;
  global_policy_id?: string | null;
};

interface PolicyLimits {
  [key: string]: {
    maxPremium: number;
    maxValue: number;
  };
}

const POLICY_LIMITS: PolicyLimits = {
  life: { maxPremium: 1000000, maxValue: 10000000 },
  health: { maxPremium: 50000, maxValue: 1000000 },
  auto: { maxPremium: 10000, maxValue: 500000 },
  home: { maxPremium: 20000, maxValue: 2000000 },
  disability: { maxPremium: 30000, maxValue: 1000000 },
  liability: { maxPremium: 50000, maxValue: 5000000 },
  business: { maxPremium: 500000, maxValue: 10000000 },
  other: { maxPremium: 100000, maxValue: 1000000 }
};

export function usePolicyForm(form: UseFormReturn<FormType>) {
  const watchPremium = form.watch('premium');
  const watchCommissionRate = form.watch('commission_rate');
  const watchPolicyType = form.watch('policy_type');
  const watchStartDate = form.watch('start_date');
  const watchEndDate = form.watch('end_date');
  const watchPaymentStructure = form.watch('payment_structure_type');
  const watchStatus = form.watch('status');
  const watchGlobalPolicyId = form.watch('global_policy_id');

  useEffect(() => {
    if (watchPremium && watchCommissionRate && !form.formState.isSubmitting) {
      const totalCommission = watchPremium * (watchCommissionRate / 100);
      form.setValue('first_year_commission', totalCommission, { shouldValidate: true });
    }
  }, [watchPremium, watchCommissionRate]);

  useEffect(() => {
    if (watchStartDate && watchEndDate && !form.formState.isSubmitting) {
      const startDate = new Date(watchStartDate);
      const endDate = new Date(watchEndDate);
      const duration = differenceInYears(endDate, startDate);
      
      if (duration >= 0 && duration <= 30) {
        form.setValue('policy_duration', duration, { shouldValidate: true });
      }
    }
  }, [watchStartDate, watchEndDate]);

  useEffect(() => {
    if (watchPremium && watchCommissionRate && form.getValues('first_year_commission') && watchPaymentStructure) {
      const totalCommission = watchPremium * (watchCommissionRate / 100);
      const firstYearCommission = form.getValues('first_year_commission') || 0;
      const remainingCommission = totalCommission - firstYearCommission;
      
      let ongoingCommission = 0;
      switch (watchPaymentStructure) {
        case 'single_premium':
        case 'one_year_term':
          ongoingCommission = 0;
          break;
        case 'regular_premium':
          ongoingCommission = Math.min(remainingCommission / 5, remainingCommission / (form.getValues('policy_duration') || 5));
          break;
        case 'five_year_premium':
          ongoingCommission = Math.min(remainingCommission / 4, remainingCommission / (form.getValues('policy_duration') || 4));
          break;
        case 'ten_year_premium':
        case 'lifetime_premium':
          ongoingCommission = Math.min(remainingCommission / 5, remainingCommission / (form.getValues('policy_duration') || 5));
          break;
      }
      
      form.setValue('annual_ongoing_commission', ongoingCommission, { shouldValidate: true });
    }
  }, [watchPremium, watchCommissionRate, watchPaymentStructure, form.getValues('first_year_commission'), form.getValues('policy_duration')]);

  const validatePolicyLimits = (value: number | undefined, type: 'premium' | 'value') => {
    if (!value || !watchPolicyType) return true;
    const limits = POLICY_LIMITS[watchPolicyType];
    if (!limits) return true;
    
    return type === 'premium' 
      ? value <= limits.maxPremium
      : value <= limits.maxValue;
  };

  const isFieldDisabled = (fieldName: keyof FormType) => {
    // If a global policy is selected, disable fields that should be populated from global policy
    if (watchGlobalPolicyId && ['policy_name', 'policy_type', 'payment_structure_type', 'premium', 'commission_rate', 
                              'policy_duration', 'provider', 'value'].includes(fieldName as string)) {
      return true;
    }

    if (watchStatus === 'expired') {
      return ['premium', 'commission_rate', 'first_year_commission', 'annual_ongoing_commission'].includes(fieldName as string);
    }
    return false;
  };

  const getValidation = (fieldName: keyof FormType) => {
    const baseValidation = {
      premium: {
        required: 'Premium is required',
        min: { value: 0, message: 'Premium must be greater than 0' },
        validate: {
          withinLimits: (value: number) => 
            validatePolicyLimits(value, 'premium') || 
            `Premium exceeds maximum limit for ${watchPolicyType} policies`
        }
      },
      value: {
        min: { value: 0, message: 'Value must be greater than 0' },
        validate: {
          withinLimits: (value: number) => 
            validatePolicyLimits(value, 'value') || 
            `Value exceeds maximum limit for ${watchPolicyType} policies`
        }
      },
      commission_rate: {
        required: 'Commission rate is required',
        min: { value: 0, message: 'Commission rate must be between 0 and 100' },
        max: { value: 100, message: 'Commission rate must be between 0 and 100' }
      },
      policy_duration: {
        min: { value: 1, message: 'Policy duration must be between 1 and 30 years' },
        max: { value: 30, message: 'Policy duration must be between 1 and 30 years' }
      },
      start_date: {
        required: 'Start date is required'
      },
      end_date: {
        required: 'End date is required',
        validate: {
          afterStart: (value: string) => {
            if (!watchStartDate || !value) return true;
            return new Date(value) > new Date(watchStartDate) || 'End date must be after start date';
          }
        }
      }
    };

    return baseValidation[fieldName as keyof typeof baseValidation] || {};
  };

  return {
    getValidation,
    isFieldDisabled
  };
}
