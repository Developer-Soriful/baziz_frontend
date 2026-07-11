import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";

export function useLogin() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: authService.login,
        onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
    });
}

export function useMe() {
    return useQuery({ queryKey: ["me"], queryFn: authService.me, retry: false });
}