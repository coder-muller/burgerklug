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
import { useEffect } from "react";

const formSchema = z.object({
    email: z.email({ message: "Email inválido" }),
    name: z.string().min(6, { message: "Nome deve ter no mínimo 6 caracteres" }),
    image: z.string().optional(),
})

type UserInfoForm = z.infer<typeof formSchema>;

export default function UserInfoForm() {

    // Get the current user data
    const { data: userData, isPending: isUserDataPending, error: userDataError } = authClient.useSession();

    const form = useForm<UserInfoForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: userData?.user?.email || "",
            name: userData?.user?.name || "",
            image: userData?.user?.image || "",
        },
    });

    useEffect(() => {
        if (userData) {
            form.reset({
                email: userData.user.email,
                name: userData.user.name,
                image: userData.user.image || "",
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData])

    const onSubmit = async (data: UserInfoForm) => {
        await authClient.updateUser({
            name: data.name,
            image: data.image,
        }, {
            onSuccess: () => {
                toast.success("Informações atualizadas com sucesso");
            },
            onError: (error) => {
                toast.error("Erro ao atualizar informações", {
                    description: getAuthErrorMessage(error.error),
                })
            }
        })
    }

    const isSubmitting = form.formState.isSubmitting || isUserDataPending || !!userDataError;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
                <Controller control={form.control} name="email" render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                        <FieldContent>
                            <Input id={field.name} placeholder="exemplo@email.com" aria-invalid={fieldState.invalid} type="email" {...field} disabled />
                        </FieldContent>
                        {fieldState.error && (
                            <FieldError>
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )} />
                <Controller control={form.control} name="name" render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                        <FieldContent>
                            <Input id={field.name} placeholder="João da Silva" aria-invalid={fieldState.invalid} type="text" {...field} disabled={isSubmitting} />
                        </FieldContent>
                        {fieldState.error && (
                            <FieldError>
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )} />
                <Controller control={form.control} name="image" render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Imagem</FieldLabel>
                        <FieldContent>
                            <Input id={field.name} placeholder="https://exemplo.com/imagem.png" aria-invalid={fieldState.invalid} type="url" {...field} disabled={isSubmitting} />
                        </FieldContent>
                        {fieldState.error && (
                            <FieldError>
                                {fieldState.error.message}
                            </FieldError>
                        )}
                    </Field>
                )} />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner /> : "Atualizar informações"}
                </Button>
            </FieldGroup>
        </form>
    )


}