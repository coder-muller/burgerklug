import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import SignInForm from "@/components/auth/sign-in/sign-in-form";

export default async function Login() {

    // Verify if the user is already authenticated
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        redirect("/dashboard");
    }

    return (
        <section className="w-full max-w-xs md:max-w-sm flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">
                    Bem-vindo de volta!
                </h1>
                <p className="text-sm text-muted-foreground">
                    Faça login para continuar
                </p>
            </div>
            <SignInForm />
        </section>
    )
}