
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import type { CreatePolicyInput, Policy } from '@/types/policy';
import { differenceInYears } from 'date-fns';

export type FormType = CreatePolicyInput | Partial<Policy & { policy_name: string; policy_type: string; payment_structure_type: Policy['payment_structure_type'] }>;

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
  const watchPolicyDuration = form.watch('policy_duration');
  const watchCommissionDuration = form.watch('commission_duration');

  // Auto-calculate first year commission
  useEffect(() => {
    if (watchPremium && watchCommissionRate && !form.formState.isSubmitting) {
      const totalCommission = watchPremium * (watchCommissionRate / 100);
      form.setValue('first_year_commission', totalCommission, { shouldValidate: true });
    }
  }, [watchPremium, watchCommissionRate, form]);

  // Auto-calculate policy duration
  useEffect(() => {
    if (watchStartDate && watchEndDate && !form.formState.isSubmitting) {
      const startDate = new Date(watchStartDate);
      const endDate = new Date(watchEndDate);
      const duration = differenceInYears(endDate, startDate);
      
      if (duration >= 0 && duration <= 30) {
        form.setValue('policy_duration', duration, { shouldValidate: true });
      }
    }
  }, [watchStartDate, watchEndDate, form]);

  // Auto-calculate ongoing commission based on payment structure
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
  }, [watchPremium, watchCommissionRate, watchPaymentStructure, form]);

  // Validate commission duration against policy duration
  useEffect(() => {
    if (watchCommissionDuration && watchPolicyDuration && watchCommissionDuration > watchPolicyDuration) {
      form.setError('commission_duration', {
        type: 'manual',
        message: 'Commission duration cannot exceed policy duration'
      });
    } else if (form.formState.errors.commission_duration?.type === 'manual') {
      form.clearErrors('commission_duration');
    }
  }, [watchCommissionDuration, watchPolicyDuration, form]);

  const validatePolicyLimits = (value: number | undefined, type: 'premium' | 'value') => {
    if (!value || !watchPolicyType) return true;
    const limits = POLICY_LIMITS[watchPolicyType];
    if (!limits) return true;
    
    return type === 'premium' 
      ? value <= limits.maxPremium
      : value <= limits.maxValue;
  };

  const isFieldDisabled = (fieldName: keyof FormType) => {
    if (watchStatus === 'expired') {
      return ['premium', 'commission_rate', 'first_year_commission', 'annual_ongoing_commission'].includes(fieldName as string);
    }
    return false;
  };

  const getValidation = (fieldName: keyof FormType) => {
    const baseValidation = {
      policy_name: {
        required: 'Policy name is required',
        minLength: { value: 2, message: 'Policy name must be at least 2 characters' }
      },
      provider: {
        required: 'Provider/Insurer is required'
      },
      policy_type: {
        required: 'Policy type is required'
      },
      premium: {
        required: 'Premium is required',
        min: { value: 0.01, message: 'Premium must be greater than 0' },
        validate: {
          withinLimits: (value: number) => 
            validatePolicyLimits(value, 'premium') || 
            `Premium exceeds maximum limit for ${watchPolicyType} policies`
        }
      },
      value: {
        required: 'Value is required',
        min: { value: 0.01, message: 'Value must be greater than 0' },
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
      ongoing_commission_rate: {
        min: { value: 0, message: 'Ongoing commission rate must be between 0 and 100' },
        max: { value: 100, message: 'Ongoing commission rate must be between 0 and 100' }
      },
      policy_duration: {
        min: { value: 1, message: 'Policy duration must be at least 1 year' },
        max: { value: 30, message: 'Policy duration must be a maximum of 30 years' },
        validate: {
          matchesDates: (value: number) => {
            if (!watchStartDate || !watchEndDate) return true;
            const startDate = new Date(watchStartDate);
            const endDate = new Date(watchEndDate);
            const calculatedDuration = differenceInYears(endDate, startDate);
            return value === calculatedDuration || 
              'Policy duration must match the difference between start and end dates';
          }
        }
      },
      commission_duration: {
        min: { value: 1, message: 'Commission duration must be at least 1 year' },
        validate: {
          notExceedingPolicy: (value: number) => {
            if (!watchPolicyDuration) return true;
            return value <= watchPolicyDuration || 
              'Commission duration cannot exceed policy duration';
          }
        }
      },
      start_date: {
        required: 'Start date is required',
        validate: {
          validDate: (value: string) => {
            return !isNaN(Date.parse(value)) || 'Please enter a valid date';
          }
        }
      },
      end_date: {
        required: 'End date is required',
        validate: {
          validDate: (value: string) => {
            return !isNaN(Date.parse(value)) || 'Please enter a valid date';
          },
          afterStart: (value: string) => {
            if (!watchStartDate || !value) return true;
            return new Date(value) > new Date(watchStartDate) || 'End date must be after start date';
          }
        }
      },
      payment_structure_type: {
        required: 'Payment structure is required'
      }
    };

    return baseValidation[fieldName as keyof typeof baseValidation] || {};
  };

  return {
    getValidation,
    isFieldDisabled
  };
}
