import { NextResponse, NextRequest } from "next/server";
import { getSession, getUserData } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";

const getCategoriesSchema = z.object({
    search: z
        .string()
        .max(100, "O campo de busca deve ter no máximo 100 caracteres")
        .trim()
        .nullable(),
    limit: z
        .string("Limite inválido")
        .min(1, "Limite inválido")
        .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "O limite deve ser um número válido maior que zero")
        .transform(Number),
    page: z
        .string("Página inválida")
        .min(1, "Página inválida")
        .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "A página deve ser um número válido maior que zero")
        .transform(Number),
    getAll: z
        .string("Get all inválido")
        .optional()
        .transform((v) => v === "true"),
})

const postCategorySchema = z.object({
    name: z
        .string("Nome inválido")
        .trim()
        .min(1, "Nome é obrigatório"),
})

export async function GET(request: NextRequest) {
    // Verify of the user is authenticated
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verify if the user exists in the database
    const user = await getUserData();
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Get params
    const { searchParams } = new URL(request.url);

    // Get raw parameters as strings for validation
    const search = searchParams.get("search") || "";

    // Validate params
    const { data: params, success: paramsSuccess, error: paramsError } = getCategoriesSchema.safeParse({ search });
    if (!paramsSuccess) {
        const errorMessages = paramsError.issues.map((issue) => {
            const field = issue.path.join(".");
            return `${field ? `${field}: ` : ""}${issue.message}`;
        });
        return NextResponse.json({ error: "Parâmetros inválidos", details: errorMessages }, { status: 400 });
    }

    // Build where clause
    const where: Prisma.CategoriesWhereInput = {
        userId: user.id,
    }

    // If search is provided, add it to the where clause
    if (params.search) {
        where.name = {
            contains: params.search,
        }
    }

    // Build order by clause
    const orderBy: Prisma.CategoriesOrderByWithRelationInput = {
        name: "asc",
    }

    // Create computed values
    const skip = params.getAll ? undefined : (params.page - 1) * params.limit
    const take = params.getAll ? undefined : params.limit

    // Try to get the categories and total number of categories
    let categories
    let total: number
    try {
        [categories, total] = await Promise.all([
            prisma.categories.findMany({ where, skip, take, orderBy }),
            prisma.categories.count({ where }),
        ])
    } catch (error) {
        console.error("Error while fetching categories: ", error);
        return NextResponse.json({ error: "Erro interno ao buscar categorias" }, { status: 500 });
    }

    return NextResponse.json({
        data: categories,
        total,
    }, { status: 200 });
}

export async function POST(request: NextRequest) {
    // Verify of the user is authenticated
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    // Verify if the user exists in the database
    const user = await getUserData();
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Validate the request body
    const { data: body, success: bodySuccess, error: bodyError } = postCategorySchema.safeParse(await request.json());
    if (!bodySuccess) {
        const errorMessages = bodyError.issues.map((issue) => {
            const field = issue.path.join(".");
            return `${field ? `${field}: ` : ""}${issue.message}`;
        });
        return NextResponse.json({ error: "Dados inválidos", details: errorMessages }, { status: 400 });
    }

    // Check if the category already exists
    try {
        const category = await prisma.categories.findFirst({
            where: {
                userId: user.id,
                name: body.name,
            },
        });
        if (category) {
            return NextResponse.json({ error: "Categoria já existe" }, { status: 400 });
        }
    } catch (error) {
        console.error("Error while checking if the category already exists: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se a categoria já existe" }, { status: 500 });
    }

    // Create the category
    let newCategory
    try {
        newCategory = await prisma.categories.create({
            data: {
                userId: user.id,
                name: body.name,
            },
        });
    } catch (error) {
        console.error("Error while creating the category: ", error);
        return NextResponse.json({ error: "Erro interno ao criar a categoria" }, { status: 500 });
    }

    return NextResponse.json({
        data: newCategory,
    }, { status: 201 });
}