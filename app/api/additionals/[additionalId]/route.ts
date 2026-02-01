import { NextResponse, NextRequest } from "next/server";
import { getSession, getUserData } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { normalizeDecimal, validateDecimal } from "@/lib/validators";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";

const patchAdditionalSchema = z.object({
    categoryId: z
        .string("ID da categoria inválida")
        .trim()
        .min(1, "ID da categoria é obrigatório"),
    description: z
        .string("Descrição inválida")
        .trim()
        .min(1, "Descrição é obrigatória")
        .max(100, "Descrição deve ter no máximo 100 caracteres"),
    additionalPrice: z
        .string("Preço adicional inválido")
        .trim()
        .min(1, "Preço adicional é obrigatório")
        .max(18, "Preço adicional deve ter no máximo 18 caracteres")
        .refine((v) => validateDecimal(v, { required: true }), "Preço adicional inválido")
        .transform((v) => normalizeDecimal(v)),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ additionalId: string }> }) {
    // Verify if user is authenticated
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verify if user exists
    const user = await getUserData();
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Get user wallet ID
    const { additionalId } = await params;
    if (!additionalId) return NextResponse.json({ error: "ID do adicional inválido" }, { status: 400 });

    // Check if additional exists and belongs to user
    try {
        const additional = await prisma.additionals.findFirst({ where: { id: additionalId, userId: user.id } });
        if (!additional) return NextResponse.json({ error: "Adicional não encontrado" }, { status: 404 });
    } catch (error) {
        console.error("Error while checking if the additional exists and belongs to the user: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se o adicional existe e pertence ao usuário" }, { status: 500 });
    }

    // Validate the request body
    const { data: body, success: bodySuccess, error: bodyError } = patchAdditionalSchema.safeParse(await request.json());
    if (!bodySuccess) {
        const errorMessages = bodyError.issues.map((issue) => {
            const field = issue.path.join(".");
            return `${field ? `${field}: ` : ""}${issue.message}`;
        });
        return NextResponse.json({ error: "Dados inválidos", details: errorMessages }, { status: 400 });
    }

    // Check if the category exists and belongs to user
    try {
        const category = await prisma.categories.findFirst({ where: { id: body.categoryId, userId: user.id } });
        if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    } catch (error) {
        console.error("Error while checking if the category exists and belongs to the user: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se a categoria existe e pertence ao usuário" }, { status: 500 });
    }

    // Update the additional
    let updatedAdditional
    try {
        updatedAdditional = await prisma.additionals.update({
            where: { id: additionalId },
            data: {
                categoryId: body.categoryId,
                description: body.description,
                additionalPrice: new Prisma.Decimal(body.additionalPrice as string)
            }
        });
    } catch (error) {
        console.error("Error while updating the additional: ", error);
        return NextResponse.json({ error: "Erro interno ao atualizar o adicional" }, { status: 500 });
    }

    return NextResponse.json({
        data: updatedAdditional,
    }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ additionalId: string }> }) {
    // Verify if user is authenticated
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verify if user exists
    const user = await getUserData();
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Get user wallet ID
    const { additionalId } = await params;
    if (!additionalId) return NextResponse.json({ error: "ID do adicional inválido" }, { status: 400 });

    // Check if additional exists and belongs to user
    try {
        const additional = await prisma.additionals.findFirst({ where: { id: additionalId, userId: user.id } });
        if (!additional) return NextResponse.json({ error: "Adicional não encontrado" }, { status: 404 });
    } catch (error) {
        console.error("Error while checking if the additional exists and belongs to the user: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se o adicional existe e pertence ao usuário" }, { status: 500 });
    }

    // Delete the additional
    try {
        await prisma.additionals.delete({ where: { id: additionalId } });
    } catch (error) {
        console.error("Error while deleting the additional: ", error);
        return NextResponse.json({ error: "Erro interno ao deletar o adicional" }, { status: 500 });
    }

    return NextResponse.json({
        data: { message: "Adicional deletado com sucesso" },
    }, { status: 200 });
}