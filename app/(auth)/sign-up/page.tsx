import SignUpForm from "@/components/auth/sign-up/sign-up-form";

export default function Register() {
    return (
        <section className="w-full max-w-xs md:max-w-sm flex flex-col items-center justify-center gap-4">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold">
                    Seja bem-vindo!
                </h1>
                <p className="text-sm text-center text-muted-foreground">
                    Crie sua conta para começar a usar o Burger Klug
                </p>
            </div>
            <SignUpForm />
        </section>
    )
}