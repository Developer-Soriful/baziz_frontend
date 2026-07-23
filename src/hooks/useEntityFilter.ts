import { useOwnership } from "../contexts/OwnershipContext";

export function useEntityFilter() {
  const { isPropertyInScope } = useOwnership();
  
  return {
    isPropertyInScope,
  };
}
