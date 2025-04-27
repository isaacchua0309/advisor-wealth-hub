
import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { PolicyFilters as PolicyFiltersType } from "@/pages/Policies";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { POLICY_TYPES, PAYMENT_STRUCTURES, POLICY_STATUSES } from "./PolicyFiltersOptions";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface PolicyFiltersProps {
  filters: PolicyFiltersType;
  setFilters: Dispatch<SetStateAction<PolicyFiltersType>>;
  clearFilters: () => void;
  maxPremium: number;
  maxFirstYearCommission: number;
}

export default function PolicyFilters({ 
  filters, 
  setFilters, 
  clearFilters,
  maxPremium,
  maxFirstYearCommission
}: PolicyFiltersProps) {
  
  const [isOpen, setIsOpen] = useState(false);
  
  const handlePremiumChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      premiumRange: [value[0], value[1]]
    }));
  };
  
  const handleCommissionRateChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      commissionRange: [value[0], value[1]]
    }));
  };
  
  const handleFirstYearCommissionChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      firstYearCommissionRange: [value[0], value[1]]
    }));
  };
  
  const handleDurationChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      policyDuration: [value[0], value[1]]
    }));
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    filters.search !== "" ||
    filters.policyType !== "all" ||
    filters.paymentStructure !== "all" ||
    filters.status !== "all" ||
    filters.policyDuration[0] > 0 ||
    filters.policyDuration[1] < 100 ||
    filters.premiumRange[0] > 0 ||
    filters.premiumRange[1] < maxPremium ||
    filters.commissionRange[0] > 0 ||
    filters.commissionRange[1] < 100 ||
    filters.firstYearCommissionRange[0] > 0 ||
    filters.firstYearCommissionRange[1] < maxFirstYearCommission ||
    filters.showRenewingThisYear ||
    filters.showTopByCommission;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">Filters</h3>
          {hasActiveFilters && (
            <div className="bg-primary text-white text-xs rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
              !
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            Clear all filters
          </Button>
        )}
      </div>
      
      {/* Basic search - always visible */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="search"
          placeholder="Search by policy name..."
          className="pl-8"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
        />
      </div>
      
      {/* Mobile filter toggle */}
      <div className="md:hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between">
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </span>
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="space-y-4">
              {/* Dropdown filters */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="policyType" className="mb-2 block">Policy Type</Label>
                  <Select
                    value={filters.policyType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, policyType: value }))}
                  >
                    <SelectTrigger id="policyType">
                      <SelectValue placeholder="All Policy Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Policy Types</SelectItem>
                      {POLICY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="paymentStructure" className="mb-2 block">Payment Structure</Label>
                  <Select
                    value={filters.paymentStructure}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStructure: value }))}
                  >
                    <SelectTrigger id="paymentStructure">
                      <SelectValue placeholder="All Payment Structures" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Structures</SelectItem>
                      {PAYMENT_STRUCTURES.map(structure => (
                        <SelectItem key={structure.value} value={structure.value}>
                          {structure.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="status" className="mb-2 block">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {POLICY_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Slider filters */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="premium">Premium Range</Label>
                    <span className="text-sm text-muted-foreground">
                      ${filters.premiumRange[0].toLocaleString()} - ${filters.premiumRange[1].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    id="premium"
                    min={0}
                    max={maxPremium}
                    step={100}
                    value={[filters.premiumRange[0], filters.premiumRange[1]]}
                    onValueChange={handlePremiumChange}
                    className="py-4"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="commission">Commission Rate (%)</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.commissionRange[0]}% - {filters.commissionRange[1]}%
                    </span>
                  </div>
                  <Slider
                    id="commission"
                    min={0}
                    max={100}
                    step={1}
                    value={[filters.commissionRange[0], filters.commissionRange[1]]}
                    onValueChange={handleCommissionRateChange}
                    className="py-4"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="firstYearCommission">First Year Commission</Label>
                    <span className="text-sm text-muted-foreground">
                      ${filters.firstYearCommissionRange[0].toLocaleString()} - ${filters.firstYearCommissionRange[1].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    id="firstYearCommission"
                    min={0}
                    max={maxFirstYearCommission}
                    step={100}
                    value={[filters.firstYearCommissionRange[0], filters.firstYearCommissionRange[1]]}
                    onValueChange={handleFirstYearCommissionChange}
                    className="py-4"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="duration">Policy Duration (Years)</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.policyDuration[0]} - {filters.policyDuration[1]} years
                    </span>
                  </div>
                  <Slider
                    id="duration"
                    min={0}
                    max={100}
                    step={1}
                    value={[filters.policyDuration[0], filters.policyDuration[1]]}
                    onValueChange={handleDurationChange}
                    className="py-4"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
      
      {/* Desktop filters */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filter by Policy Type */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label htmlFor="policyType" className="mb-2 block">Policy Type</Label>
                  <Select
                    value={filters.policyType}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, policyType: value }))}
                  >
                    <SelectTrigger id="policyType">
                      <SelectValue placeholder="All Policy Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Policy Types</SelectItem>
                      {POLICY_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter policies by their type (e.g., Life, Health, Property)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Filter by Payment Structure */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label htmlFor="paymentStructure" className="mb-2 block">Payment Structure</Label>
                  <Select
                    value={filters.paymentStructure}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, paymentStructure: value }))}
                  >
                    <SelectTrigger id="paymentStructure">
                      <SelectValue placeholder="All Payment Structures" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payment Structures</SelectItem>
                      {PAYMENT_STRUCTURES.map(structure => (
                        <SelectItem key={structure.value} value={structure.value}>
                          {structure.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter by how premiums are paid over the policy lifetime</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Filter by Status */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Label htmlFor="status" className="mb-2 block">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {POLICY_STATUSES.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter policies by their current status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Filter by Premium Range */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="premium">Premium Range</Label>
                    <span className="text-sm text-muted-foreground">
                      ${filters.premiumRange[0].toLocaleString()} - ${filters.premiumRange[1].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    id="premium"
                    min={0}
                    max={maxPremium}
                    step={100}
                    value={[filters.premiumRange[0], filters.premiumRange[1]]}
                    onValueChange={handlePremiumChange}
                    className="py-4"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter policies by their premium amount</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Filter by Commission Rate */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="commission">Commission Rate (%)</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.commissionRange[0]}% - {filters.commissionRange[1]}%
                    </span>
                  </div>
                  <Slider
                    id="commission"
                    min={0}
                    max={100}
                    step={1}
                    value={[filters.commissionRange[0], filters.commissionRange[1]]}
                    onValueChange={handleCommissionRateChange}
                    className="py-4"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter policies by their commission rate percentage</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Filter by First Year Commission */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="firstYearCommission">First Year Commission ($)</Label>
                    <span className="text-sm text-muted-foreground">
                      ${filters.firstYearCommissionRange[0].toLocaleString()} - ${filters.firstYearCommissionRange[1].toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    id="firstYearCommission"
                    min={0}
                    max={maxFirstYearCommission}
                    step={100}
                    value={[filters.firstYearCommissionRange[0], filters.firstYearCommissionRange[1]]}
                    onValueChange={handleFirstYearCommissionChange}
                    className="py-4"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter by the commission amount received in the first year</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Filter by Policy Duration */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <div className="flex justify-between mb-2">
                    <Label htmlFor="duration">Policy Duration (Years)</Label>
                    <span className="text-sm text-muted-foreground">
                      {filters.policyDuration[0]} - {filters.policyDuration[1]} years
                    </span>
                  </div>
                  <Slider
                    id="duration"
                    min={0}
                    max={100}
                    step={1}
                    value={[filters.policyDuration[0], filters.policyDuration[1]]}
                    onValueChange={handleDurationChange}
                    className="py-4"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter policies by their duration in years</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
