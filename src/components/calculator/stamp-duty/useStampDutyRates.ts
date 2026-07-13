import { useQuery } from "@tanstack/react-query";
import { calculatorService } from "@/lib/services/calculator.service";

export function useStampDutyRates() {
  return useQuery({
    queryKey: ["stampDutyRates"],
    queryFn: () => calculatorService.getStampDutyRates(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
