import DeleteAccountCard from "@/components/protected/account/delete-account-card";
import PasswordForm from "@/components/protected/account/password-form";
import SessionsCard from "@/components/protected/account/sessions-card";
import UserInfoForm from "@/components/protected/account/user-info-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function AccountPage() {

    // Verify if the user is authenticated
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect("/sign-in")

    return (
        <main className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Informações da conta
                        </CardTitle>
                        <CardDescription>
                            Gerencie suas informações de conta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserInfoForm />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Senha de acesso
                        </CardTitle>
                        <CardDescription>
                            Gerencie sua senha de acesso
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PasswordForm />
                    </CardContent>
                </Card>
            </div>

            <SessionsCard />

            <DeleteAccountCard />

        </main>
    )
}