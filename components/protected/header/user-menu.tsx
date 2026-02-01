"use client"

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCogIcon, ShieldCheckIcon, SunIcon, MoonIcon, LogOutIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { getAuthErrorMessage } from "@/lib/auth-errors";

interface UserMenuProps {
    userName: string;
    userEmail: string;
    userImage: string;
    isAdmin: boolean;
}

export function UserMenu({ userName, userEmail, userImage, isAdmin }: UserMenuProps) {

    // Hooks
    const router = useRouter()
    const { setTheme, theme } = useTheme()

    // State
    const [isSigningOut, setIsSigningOut] = useState(false)

    // Functions
    const handleThemeChange = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    const handleSignOut = async () => {
        setIsSigningOut(true)
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/sign-in")
                },
                onError: (error) => {
                    toast.error("Erro ao fazer logout", {
                        description: getAuthErrorMessage(error.error),
                    })
                },
            }
        })
        setIsSigningOut(false)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0 relative">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={userImage} alt="Profile" />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                    <>
                        <Link href="/admin">
                            <DropdownMenuItem>
                                <ShieldCheckIcon />
                                Administrador
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                    </>
                )}
                <Link href="/account">
                    <DropdownMenuItem>
                        <UserCogIcon />
                        Conta
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem onClick={handleThemeChange}>
                    <SunIcon className="block dark:hidden size-4" />
                    <MoonIcon className="hidden dark:block size-4" />
                    Mudar tema
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={async () => await handleSignOut()}
                    onSelect={(e) => e.preventDefault()}
                    disabled={isSigningOut}
                    className="group focus:text-destructive hover:text-destructive transition-colors duration-200"
                >
                    <LogOutIcon className="group-hover:text-destructive transition-colors duration-200" />
                    {isSigningOut ? "Saindo..." : "Sair"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}