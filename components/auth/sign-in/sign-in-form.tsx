"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import OAuthButtons from "../oauth-buttons";

import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

const formSchema = z.object({
    email: z.email({ message: "Email inválido" }),
    password: z.string().min(1, { message: "Senha é obrigatória" }),
})

export default function SignInForm() {

    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        await authClient.signIn.email({
            email: data.email,
            password: data.password,
        }, {
            onSuccess: () => {
                router.push("/dashboard");
            },
            onError: (error) => {
                toast.error("Erro ao fazer login", {
                    description: getAuthErrorMessage(error.error),
                })
            }
        })
    }

    const isSubmitting = form.formState.isSubmitting;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-xs md:max-w-sm">
            <FieldGroup>
                <Controller control={form.control} name="email" render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <FieldContent>
                            <Input id={field.name} aria-invalid={fieldState.invalid} type="email" placeholder="exemplo@email.com" {...field} disabled={isSubmitting} />
                        </FieldContent>
                        {fieldState.error && (
                            <FieldError>
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )} />
                <Controller control={form.control} name="password" render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                        <FieldContent>
                            <Input id={field.name} aria-invalid={fieldState.invalid} type="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" {...field} disabled={isSubmitting} />
                        </FieldContent>
                        {fieldState.error && (
                            <FieldError>
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : "Entrar"}
                </Button>
                <p className="text-sm text-center">
                    Não tem uma conta? <Link href="/sign-up" className="text-primary hover:text-primary/80 font-medium hover:underline">Cadastre-se</Link>
                </p>
                <FieldSeparator className="my-2" />
                <OAuthButtons isSubmitting={isSubmitting} />
            </FieldGroup>
        </form>
    )
}