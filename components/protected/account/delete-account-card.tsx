"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Spinner } from "@/components/ui/spinner"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { getAuthErrorMessage } from "@/lib/auth-errors"

const formSchema = z.object({
    password: z.string().min(1, { message: "Senha é obrigatória" }),
})

export default function DeleteAccountCard() {

    // Hooks
    const router = useRouter()

    // Form
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: "",
        },
    })

    // Functions
    async function onSubmit(values: z.infer<typeof formSchema>) {
        await authClient.deleteUser({
            password: values.password,
        }, {
            onSuccess: () => {
                toast.success("Conta excluída com sucesso")
                router.push("/")
            },
            onError: (error) => {
                toast.error("Erro ao excluir conta", {
                    description: getAuthErrorMessage(error.error),
                })
            }
        })
    }


    return (
        <Card className="border-destructive/20 shadow-destructive h-max">
            <CardHeader>
                <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                <CardDescription>Tenha cuidado com estas configurações</CardDescription>
            </CardHeader>
            <CardContent>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                            Excluir Conta
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Excluir Conta</DialogTitle>
                            <DialogDescription>Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField control={form.control} name="password" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar Senha</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="password" placeholder="Confirmar Senha" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline" type="button">Cancelar</Button>
                                    </DialogClose>
                                    <Button type="submit" variant="destructive" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? (
                                            <Spinner className="size-4" />
                                        ) : (
                                            "Excluir Conta"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    )
}