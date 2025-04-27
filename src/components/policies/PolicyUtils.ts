import { Policy } from "@/types/policy";
import { format, differenceInYears, addYears, addMonths, differenceInDays } from "date-fns";

// Format currency to USD
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "$0";
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Format percentage 
export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100); // Assuming the value is already multiplied by 100
};

// Calculate the next renewal date for a policy
export const calculateNextRenewalDate = (policy: Policy): Date | null => {
  if (!policy.start_date) return null;
  
  const startDate = new Date(policy.start_date);
  const currentDate = new Date();
  
  // Calculate years since policy started
  const yearsSinceStart = differenceInYears(currentDate, startDate);
  
  // Calculate next anniversary date
  let nextAnniversary = addYears(startDate, yearsSinceStart);
  
  // If the anniversary already passed this year, go to next year
  if (nextAnniversary < currentDate) {
    nextAnniversary = addYears(startDate, yearsSinceStart + 1);
  }
  
  return nextAnniversary;
};

// Calculate days until the next renewal
export const calculateDaysUntilRenewal = (policy: Policy): number | null => {
  const renewalDate = calculateNextRenewalDate(policy);
  
  if (!renewalDate) return null;
  
  const today = new Date();
  return differenceInDays(renewalDate, today);
};

// Check if a policy is renewing soon within specified days
export const isRenewingSoon = (policy: Policy, days: number): boolean => {
  const nextRenewal = calculateNextRenewalDate(policy);
  if (!nextRenewal) return false;
  
  const currentDate = new Date();
  const daysUntilRenewal = differenceInDays(nextRenewal, currentDate);
  
  return daysUntilRenewal >= 0 && daysUntilRenewal <= days;
};

// Calculate the age of a policy in years
export const calculatePolicyAge = (policy: Policy): number | null => {
  if (!policy.start_date) return null;
  
  const startDate = new Date(policy.start_date);
  const currentDate = new Date();
  
  return differenceInYears(currentDate, startDate);
};

// Calculate the premium to value ratio as a percentage
export const calculatePremiumToValueRatio = (policy: Policy): number | null => {
  if (!policy.premium || !policy.value || policy.value === 0) return null;
  
  return (policy.premium / policy.value) * 100;
};

// Calculate the total expected commission over the life of the policy
export const calculateTotalExpectedCommission = (policy: Policy): number => {
  const firstYear = policy.first_year_commission || 0;
  const ongoing = policy.annual_ongoing_commission || 0;
  const duration = policy.commission_duration || 0;
  
  // If there's ongoing commission, add it for remaining years
  return firstYear + (ongoing * Math.max(0, duration - 1));
};

// Calculate the date when commission payments will end
export const calculateCommissionMaturityDate = (policy: Policy): Date | null => {
  if (!policy.start_date || !policy.commission_duration) return null;
  
  const startDate = new Date(policy.start_date);
  return addYears(startDate, policy.commission_duration);
};

// Format date in a readable format or return appropriate message
export const formatReadableDate = (date: Date | null): string => {
  if (!date) return '—';
  
  return format(date, 'MMM d, yyyy');
};

// Calculate yearly commissions for projection
export interface YearlyCommission {
  year: number;
  amount: number;
}

export const calculateYearlyCommissions = (
  policies: Policy[], 
  startYear: number,
  numberOfYears: number
): YearlyCommission[] => {
  const result: YearlyCommission[] = [];
  
  // Initialize with zeros for all years
  for (let i = 0; i < numberOfYears; i++) {
    result.push({
      year: startYear + i,
      amount: 0
    });
  }
  
  policies.forEach(policy => {
    if (!policy.start_date) return;
    
    const startDate = new Date(policy.start_date);
    const policyStartYear = startDate.getFullYear();
    
    // For each year in our projection
    for (let i = 0; i < numberOfYears; i++) {
      const projectionYear = startYear + i;
      const yearsSincePolicyStart = projectionYear - policyStartYear;
      
      // First year commission
      if (yearsSincePolicyStart === 0 && projectionYear >= policyStartYear) {
        result[i].amount += policy.first_year_commission || 0;
      } 
      // Ongoing commission for subsequent years
      else if (
        yearsSincePolicyStart > 0 && 
        (policy.commission_duration === null || yearsSincePolicyStart <= policy.commission_duration)
      ) {
        result[i].amount += policy.annual_ongoing_commission || 0;
      }
    }
  });
  
  return result;
};
