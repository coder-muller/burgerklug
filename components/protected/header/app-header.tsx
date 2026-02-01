import { HamburgerIcon } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "./user-menu";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HeaderNavigation, NavItem } from "./header-navigation";
import { Label } from "@/components/ui/label";

export const NAV_ITEMS: NavItem[] = [
    { label: "Dashboard", value: "dashboard", href: "/dashboard" },
    { label: "Vendas", value: "sales", href: "/sales" },
    { label: "Pedidos", value: "orders", href: "/orders" },
    { label: "Produtos", value: "products", href: "/products" },
]

export async function AppHeader() {
    // Check if user is logged in
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (!session) {
        redirect("/login")
    }

    const isAdmin = session.user?.role === "admin"

    return (
        <>
            <header className="bg-background sticky top-0 z-50">
                <div className="flex h-14 items-center justify-between px-6 gap-8">
                    <div className="flex items-center gap-4 min-w-0">
                        <Link href="/" className="flex items-center gap-2 shrink-0">
                            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                                <HamburgerIcon className="size-4 text-primary-foreground" />
                            </div>
                            <Label className="hidden md:block text-xl font-bold leading-tight tracking-tighter select-none">
                                Burger Klug
                            </Label>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4 ml-auto">
                        <UserMenu
                            userName={session.user?.name}
                            userEmail={session.user?.email}
                            userImage={session.user?.image ?? ""}
                            isAdmin={isAdmin}
                        />
                    </div>
                </div>
            </header>
            <HeaderNavigation items={NAV_ITEMS} />
        </>
    )
}