"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { authClient } from "@/lib/auth-client"
import { Session } from "better-auth"
import { useEffect, useMemo, useState } from "react"
import { UAParser } from "ua-parser-js"
import { Computer, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { getAuthErrorMessage } from "@/lib/auth-errors";

export default function SessionsCard() {

    // Hooks
    const { data: session } = authClient.useSession()

     // States
     const [isLoading, setIsLoading] = useState(true)
     const [sessions, setSessions] = useState<Session[]>([])

    // Effects
    useEffect(() => {
        const fetchSessions = async () => {
            const sessions = await authClient.listSessions()
            setSessions(sessions.data ?? [])
            setIsLoading(false)
        }
        fetchSessions()
    }, [])

    // Functions
    const fetchSessions = async () => {
        const sessions = await authClient.listSessions()
        setSessions(sessions.data ?? [])
        setIsLoading(false)
    }

    const revokeSessions = async () => {
        await authClient.revokeOtherSessions(
            {}, {
            onSuccess: () => {
                toast.success("Sessões excluídas com sucesso")
                fetchSessions()
            },
            onError: (error) => {
                toast.error("Erro ao excluir sessões", {
                    description: getAuthErrorMessage(error.error),
                })
            }
        }
        )
    }

    const revokeSession = async (token: string) => {
        await authClient.revokeSession({ token: token }, {
            onSuccess: () => {
                toast.success("Sessão excluída com sucesso")
                fetchSessions()
            },
            onError: (error) => {
                toast.error("Erro ao excluir sessão", {
                    description: getAuthErrorMessage(error.error),
                })
            }
        })
    }

    const currentSessionId = useMemo(() => {
        return (session as unknown as { session: { id: string } })?.session?.id ?? (session as unknown as { id: string })?.id ?? null
    }, [session])

    const parsedSessions = useMemo(() => {
        return sessions.map((s) => {
            const parser = new UAParser(s.userAgent || "")
            const result = parser.getResult()
            const deviceType = result.device.type || (result.device.model ? "mobile" : "desktop")
            const isMobile = deviceType === "mobile" || deviceType === "tablet"
            const browser = [result.browser.name, result.browser.version].filter(Boolean).join(" ")
            const os = [result.os.name, result.os.version].filter(Boolean).join(" ")
            const device = result.device.model || (isMobile ? "Mobile" : "Desktop")
            return { ...s, browser, os, device, isMobile }
        })
    }, [sessions])

    if (isLoading) {
        return (
            <Card className="grid-cols-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Sessões</CardTitle>
                    <CardDescription>Gerencie suas sessões ativas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sessão Ativa</CardTitle>
                                <CardDescription>Seu dispositivo atual e atividade recente</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="w-full h-24" />
                            </CardContent>
                        </Card>
                        <Card className="h-max w-full">
                            <CardHeader>
                                <CardTitle>Todas as Sessões</CardTitle>
                                <CardDescription>Dispositivos atualmente logados em sua conta</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="w-full h-24" />
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (sessions.length === 0) {
        return (
            <Card className="grid-cols-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>Sessões</CardTitle>
                    <CardDescription>Gerencie suas sessões ativas</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Sessão Ativa</CardTitle>
                                <CardDescription>Seu dispositivo atual e atividade recente</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">Nenhuma informação de sessão disponível.</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const currentSession = parsedSessions.find((s) => s.id === currentSessionId)

    return (
        <Card className="grid-cols-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Sessões</CardTitle>
                <CardDescription>Gerencie suas sessões ativas</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    {currentSession && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                    {currentSession.isMobile ? (
                                        <Smartphone className="size-5" />
                                    ) : (
                                        <Computer className="size-5" />
                                    )}
                                    <div className="flex flex-col">
                                        <CardTitle className="text-base">Sessão Ativa</CardTitle>
                                        <CardDescription className="text-xs">Este dispositivo está atualmente logado</CardDescription>
                                    </div>
                                </div>
                                <Badge>Ativa</Badge>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Dispositivo</span>
                                    <span className="text-sm font-medium">{currentSession.device}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">OS</span>
                                    <span className="text-sm font-medium">{currentSession.os || "Desconhecido"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Navegador</span>
                                    <span className="text-sm font-medium">{currentSession.browser || "Desconhecido"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">IP</span>
                                    <span className="text-sm font-mono">{currentSession.ipAddress || "—"}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Criado em</span>
                                    <span className="text-sm">{new Date(currentSession.createdAt).toLocaleString("pt-BR")}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground">Atualizado em</span>
                                    <span className="text-sm">{new Date(currentSession.updatedAt).toLocaleString("pt-BR")}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader className="flex flex-col md:flex-row items-center justify-between">
                            <div className="flex flex-col">
                                <CardTitle className="text-base">Todas as Sessões</CardTitle>
                                <CardDescription className="text-xs">Dispositivos atualmente logados em sua conta</CardDescription>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" className="w-full md:w-auto">Excluir Todas as Sessões</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Excluir Todas as Sessões</AlertDialogTitle>
                                        <AlertDialogDescription>Isso irá desconectar sua conta de todos os dispositivos. Tem certeza?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => revokeSessions()}>
                                            Excluir Todas as Sessões
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardHeader>
                        <Separator />
                        <CardContent className="flex flex-col gap-2">
                            {parsedSessions.filter((s) => s.id !== currentSessionId).length > 0 ? (
                                parsedSessions.filter((s) => s.id !== currentSessionId).map((s) => (
                                    <div key={s.id} className="flex items-center justify-between gap-2 border rounded-md p-3">
                                        <div className="flex items-center gap-3">
                                            {s.isMobile ? <Smartphone className="size-4" /> : <Computer className="size-4" />}
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{s.device}</span>
                                                <span className="text-xs text-muted-foreground">{s.os} • {s.browser}</span>
                                                <span className="text-xs text-muted-foreground">IP: <span className="font-mono">{s.ipAddress || "—"}</span></span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {s.id === currentSessionId ? (
                                                <Badge variant="secondary">Ativa</Badge>
                                            ) : null}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" className="text-destructive">Excluir</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Excluir Sessão</AlertDialogTitle>
                                                        <AlertDialogDescription>Tem certeza que deseja excluir esta sessão?</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => revokeSession(s.token)}>
                                                            Excluir
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center p-4">
                                    <p className="text-sm text-muted-foreground">Nenhuma outra sessão encontrada</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}