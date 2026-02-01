import { Label } from "@/components/ui/label";

export default function DashboardPage() {
    return (
        <main className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <Label className="text-xl font-bold leading-tight tracking-tighter select-none">Dashboard</Label>
                <Label className="text-sm text-muted-foreground">Tenha uma visão geral de suas vendas e pedidos</Label>
            </div>
        </main>
    )
}