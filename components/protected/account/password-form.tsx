"use client";

import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { getAuthErrorMessage } from "@/lib/auth-errors";

const formSchema = z.object({
    password: z.string().min(8, { message: "Senha deve ter no mínimo 8 caracteres" }),
    newPassword: z
        .string()
        .min(8, { message: "Nova senha deve ter no mínimo 8 caracteres" })
        .refine(
            (password) =>
                /[a-z]/.test(password) && // letra minúscula
                /[A-Z]/.test(password) && // letra maiúscula
                /\d/.test(password),      // número
            { message: "Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número" }
        ),
    confirmNewPassword: z.string()
        .min(8, { message: "Confirmar nova senha deve ter no mínimo 8 caracteres" })
        .refine(
            (password) =>
                /[a-z]/.test(password) && // letra minúscula
                /[A-Z]/.test(password) && // letra maiúscula
                /\d/.test(password),      // número
            { message: "Senha deve conter pelo menos uma letra maiúscula, uma letra minúscula e um número" }
        ),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmNewPassword"],
    message: "As senhas não coincidem",
})

type PasswordForm = z.infer<typeof formSchema>;

export default function PasswordForm() {

    const form = useForm<PasswordForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
            newPassword: "",
            confirmNewPassword: "",
        },
    })

    const onSubmit = async (data: PasswordForm) => {
        await authClient.changePassword({
            currentPassword: data.password,
            newPassword: data.newPassword,
        }, {
            onSuccess: () => {
                toast.success("Senha atualizada com sucesso");
                form.reset({
                    password: "",
                    newPassword: "",
                    confirmNewPassword: "",
                });
            },
            onError: (error) => {
                toast.error("Erro ao atualizar senha", {
                    description: getAuthErrorMessage(error.error),
                })
            }
        })
    }

    const isSubmitting = form.formState.isSubmitting;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller control={form.control} name="password" render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Senha atual</FieldLabel>
                        <FieldContent>
                            <Input id={field.name} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" aria-invalid={fieldState.invalid} type="password" {...field} disabled={isSubmitting} />
                        </FieldContent>
                        {fieldState.error && (
                            <FieldError>
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )} />
                <Controller control={form.control} name="newPassword" render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Nova senha</FieldLabel>
                        <FieldContent>
                            <Input id={field.name} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" aria-invalid={fieldState.invalid} type="password" {...field} disabled={isSubmitting} />
                        </FieldContent>
                        {fieldState.error && (
                            <FieldError>
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )} />
                <Controller control={form.control} name="confirmNewPassword" render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Confirmar nova senha</FieldLabel>
                        <FieldContent>
                            <Input id={field.name} placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" aria-invalid={fieldState.invalid} type="password" {...field} disabled={isSubmitting} />
                        </FieldContent>
                        {fieldState.error && (
                            <FieldError>
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : "Atualizar senha"}
                </Button>
            </FieldGroup>
        </form>
    )
}