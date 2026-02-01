import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
        usePlural: true,
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    user: {
        deleteUser: {
            enabled: true,
        }
    },
    plugins: [
        nextCookies(),
        admin(),
    ],
});