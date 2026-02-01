import { AppHeader } from "@/components/protected/header/app-header";
import { InpersonateButton } from "@/components/inpersonate-button";
import { QueryProvider } from "@/components/query-provider";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <div className="min-h-screen flex flex-col">
                <AppHeader />
                <main className="flex-1 p-4 container mx-auto overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
                <InpersonateButton />
            </div>
        </QueryProvider>
    )
}