import { NextResponse, NextRequest } from "next/server";
import { getSession, getUserData } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { validateDecimal, normalizeDecimal } from "@/lib/validators";

const patchProductSchema = z.object({
    categoryId: z
        .string("ID da categoria inválida")
        .trim()
        .min(1, "ID da categoria é obrigatório")
        .max(100, "ID da categoria deve ter no máximo 100 caracteres"),
    name: z
        .string("Nome inválido")
        .trim()
        .min(1, "Nome é obrigatório")
        .max(100, "Nome deve ter no máximo 100 caracteres"),
    description: z
        .string("Descrição inválida")
        .trim()
        .max(255, "Descrição deve ter no máximo 1000 caracteres"),
    unitCost: z
        .string("Custo unitário inválido")
        .trim()
        .min(1, "Custo unitário é obrigatório")
        .max(18, "Custo unitário deve ter no máximo 18 caracteres")
        .refine((v) => validateDecimal(v, { required: true }), "Custo unitário inválido")
        .transform((v) => normalizeDecimal(v)),
    unitPrice: z
        .string("Preço unitário inválido")
        .trim()
        .min(1, "Preço unitário é obrigatório")
        .max(18, "Preço unitário deve ter no máximo 18 caracteres")
        .refine((v) => validateDecimal(v, { required: true }), "Preço unitário inválido")
        .transform((v) => normalizeDecimal(v)),
    isActive: z
        .string("Status inválido")
        .trim()
        .min(1, "Status é obrigatório")
        .max(5, "Status deve ter no máximo 5 caracteres")
        .transform((v) => v === "true"),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    // Verify if user is authenticated
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verify if user exists
    const user = await getUserData();
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Get user wallet ID
    const { productId } = await params;
    if (!productId) return NextResponse.json({ error: "ID do produto inválido" }, { status: 400 });

    // Check if product exists and belongs to user
    try {
        const product = await prisma.products.findFirst({ where: { id: productId, userId: user.id } });
        if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    } catch (error) {
        console.error("Error while checking if the product exists and belongs to the user: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se o produto existe e pertence ao usuário" }, { status: 500 });
    }

    // Validate the request body
    const { data: body, success: bodySuccess, error: bodyError } = patchProductSchema.safeParse(await request.json());
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


    // Update the product
    let updatedProduct
    try {
        updatedProduct = await prisma.products.update({
            where: { id: productId },
            data: {
                categoryId: body.categoryId,
                name: body.name,
                description: body.description,
                unitCost: new Prisma.Decimal(body.unitCost as string),
                unitPrice: new Prisma.Decimal(body.unitPrice as string),
                isActive: body.isActive,
            },
        });
    } catch (error) {
        console.error("Error while updating the product: ", error);
        return NextResponse.json({ error: "Erro interno ao atualizar o produto" }, { status: 500 });
    }

    return NextResponse.json({
        data: updatedProduct,
    }, { status: 200 });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
    // Verify if user is authenticated
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verify if user exists
    const user = await getUserData();
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Get user wallet ID
    const { productId } = await params;
    if (!productId) return NextResponse.json({ error: "ID do produto inválido" }, { status: 400 });

    // Check if product exists and belongs to user
    try {
        const product = await prisma.products.findFirst({ where: { id: productId, userId: user.id } });
        if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    } catch (error) {
        console.error("Error while checking if the product exists and belongs to the user: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se o produto existe e pertence ao usuário" }, { status: 500 });
    }

    // Delete the product
    try {
        await prisma.products.delete({ where: { id: productId } });
    } catch (error) {
        console.error("Error while deleting the product: ", error);
        return NextResponse.json({ error: "Erro interno ao deletar o produto" }, { status: 500 });
    }

    return NextResponse.json({
        data: { message: "Produto deletado com sucesso" },
    }, { status: 200 });
}