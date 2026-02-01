import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <main className="relative min-h-screen flex items-center justify-center">
            <div className="absolute top-0 left-0 w-full flex items-center justify-between p-4">
                <Link href="/">
                    <Button variant="ghost" className="group">
                        <ArrowLeftIcon className="size-4 group-hover:-translate-x-1 transition-transform duration-300" />
                        Voltar
                    </Button>
                </Link>
                <ThemeToggle />
            </div>
            {children}
        </main>
    )
}