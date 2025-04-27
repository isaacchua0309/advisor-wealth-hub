
import { Policy } from "@/types/policy";
import { differenceInYears, addYears, format } from "date-fns";

// Format currency with dollar sign
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) return "—";
  return `$${amount.toLocaleString()}`;
};

// Format percentage with % sign
export const formatPercentage = (percentage: number | null | undefined): string => {
  if (percentage === null || percentage === undefined) return "—";
  return `${percentage}%`;
};

// Format date from ISO to readable format
export const formatDate = (date: string | null | undefined): string => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
};

// Get a color based on policy status
export const getStatusColor = (status: string | null | undefined): string => {
  if (!status) return "gray";
  
  status = status.toLowerCase();
  
  if (status === "active") return "green";
  if (status === "inactive" || status === "expired") return "red";
  if (status === "pending") return "orange";
  if (status === "cancelled") return "gray";
  
  return "gray";
};

// Calculate policy time remaining (in percentage)
export const calculateTimeRemaining = (policy: Policy): number => {
  if (!policy.start_date || !policy.end_date) return 0;
  
  const startDate = new Date(policy.start_date);
  const endDate = new Date(policy.end_date);
  const currentDate = new Date();
  
  // If policy hasn't started yet
  if (currentDate < startDate) return 0;
  // If policy has ended
  if (currentDate > endDate) return 100;
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = currentDate.getTime() - startDate.getTime();
  
  return Math.round((elapsed / totalDuration) * 100);
};

// Calculate total expected commission over the lifetime of the policy
export const calculateTotalExpectedCommission = (policy: Policy): number => {
  const firstYearCommission = policy.first_year_commission || 0;
  const annualOngoingCommission = policy.annual_ongoing_commission || 0;
  const commissionDuration = policy.commission_duration || 0;
  
  return firstYearCommission + (annualOngoingCommission * commissionDuration);
};

// Calculate premium to value ratio as a percentage
export const calculatePremiumToValueRatio = (policy: Policy): number | null => {
  if (!policy.premium || !policy.value || policy.value === 0) return null;
  
  return (policy.premium / policy.value) * 100;
};

// Calculate policy age in years
export const calculatePolicyAge = (policy: Policy): number | null => {
  if (!policy.start_date) return null;
  
  const startDate = new Date(policy.start_date);
  const currentDate = new Date();
  
  return differenceInYears(currentDate, startDate);
};

// Calculate commission maturity date
export const calculateCommissionMaturityDate = (policy: Policy): Date | null => {
  if (!policy.start_date || !policy.commission_duration) return null;
  
  const startDate = new Date(policy.start_date);
  return addYears(startDate, policy.commission_duration);
};

// Calculate next renewal date
export const calculateNextRenewalDate = (policy: Policy): Date | null => {
  if (!policy.start_date) return null;
  
  const startDate = new Date(policy.start_date);
  const currentDate = new Date();
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();
  
  let renewalDate = new Date(currentDate.getFullYear(), startMonth, startDay);
  
  // If the renewal date for this year has already passed, get next year's date
  if (renewalDate < currentDate) {
    renewalDate.setFullYear(currentDate.getFullYear() + 1);
  }
  
  return renewalDate;
};

// Format date in a more readable format
export const formatReadableDate = (date: Date | null): string => {
  if (!date) return "—";
  return format(date, 'MMM d, yyyy');
};

// Check if a policy is renewing within the next X days
export const isRenewingSoon = (policy: Policy, days: number = 90): boolean => {
  const nextRenewal = calculateNextRenewalDate(policy);
  if (!nextRenewal) return false;
  
  const currentDate = new Date();
  const futureDate = new Date();
  futureDate.setDate(currentDate.getDate() + days);
  
  return nextRenewal >= currentDate && nextRenewal <= futureDate;
};
