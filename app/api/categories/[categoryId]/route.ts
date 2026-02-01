import { NextResponse, NextRequest } from "next/server";
import { getSession, getUserData } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { z } from "zod";

const patchCategorySchema = z.object({
    name: z
        .string("Nome inválido")
        .trim()
        .min(1, "Nome é obrigatório")
        .max(100, "Nome deve ter no máximo 100 caracteres")
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
    // Verify if user is authenticated
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verify if user exists
    const user = await getUserData();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Get user wallet ID
    const { categoryId } = await params;
    if (!categoryId) return NextResponse.json({ error: "ID da categoria inválida" }, { status: 400 });

    // Check if category exists and belongs to user
    try {
        const category = await prisma.categories.findFirst({ where: { id: categoryId, userId: user.id } });
        if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    } catch (error) {
        console.error("Error while checking if the category exists and belongs to the user: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se a categoria existe e pertence ao usuário" }, { status: 500 });
    }

    // Validate the request body
    const { data: body, success: bodySuccess, error: bodyError } = patchCategorySchema.safeParse(await request.json());
    if (!bodySuccess) {
        const errorMessages = bodyError.issues.map((issue) => {
            const field = issue.path.join(".");
            return `${field ? `${field}: ` : ""}${issue.message}`;
        });
        return NextResponse.json({ error: "Dados inválidos", details: errorMessages }, { status: 400 });
    }

    // Check if the category name is already in use
    try {
        const category = await prisma.categories.findFirst({ where: { name: body.name, userId: user.id, id: { not: categoryId } } });
        if (category) return NextResponse.json({ error: "Nome de categoria já em uso" }, { status: 400 });
    } catch (error) {
        console.error("Error while checking if the category name is already in use: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se o nome de categoria já está em uso" }, { status: 500 });
    }

    // Update the category
    let updatedCategory
    try {
        updatedCategory = await prisma.categories.update({ where: { id: categoryId }, data: { name: body.name } });
    } catch (error) {
        console.error("Error while updating the category: ", error);
        return NextResponse.json({ error: "Erro interno ao atualizar a categoria" }, { status: 500 });
    }

    return NextResponse.json({
        data: updatedCategory,
    }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
    // Verify if user is authenticated
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verify if user exists
    const user = await getUserData();
    if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Get user wallet ID
    const { categoryId } = await params;
    if (!categoryId) return NextResponse.json({ error: "ID da categoria inválida" }, { status: 400 });

    // Check if category exists and belongs to user
    try {
        const category = await prisma.categories.findFirst({ where: { id: categoryId, userId: user.id } });
        if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 });
    } catch (error) {
        console.error("Error while checking if the category exists and belongs to the user: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se a categoria existe e pertence ao usuário" }, { status: 500 });
    }

    // Delete the category
    try {
        await prisma.categories.delete({ where: { id: categoryId } });
    } catch (error) {
        console.error("Error while deleting the category: ", error);
        return NextResponse.json({ error: "Erro interno ao deletar a categoria" }, { status: 500 });
    }

    return NextResponse.json({
        data: { message: "Categoria deletada com sucesso" },
    }, { status: 200 });
}
