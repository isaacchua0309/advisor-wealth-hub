
import { Policy } from "@/types/policy";

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
