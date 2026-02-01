"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

export function QueryProvider({ children }: { children: React.ReactNode }) {

    // Query Client
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                gcTime: 0,
                staleTime: 0,
                retry: false,
                refetchOnWindowFocus: true,
                refetchOnMount: true,
                refetchOnReconnect: true,
            }
        }
    })

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}