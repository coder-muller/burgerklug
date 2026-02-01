import { auth } from "./auth";
import { headers } from "next/headers";
import prisma from "./prisma";

export async function getSession() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) return null

    return session
}

export async function getUserData() {
    const session = await getSession()

    if (!session) return null

    const user = await prisma.users.findUnique({
        where: {
            id: session.user.id,
        },
    })

    if (!user) return null

    return user
}

export async function isUserAdmin() {
    const session = await getSession()

    if (!session) return false

    const isAdmin = session.user.role === "admin" ? true : false

    return isAdmin
}
