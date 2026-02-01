import { NextResponse, NextRequest } from "next/server";
import { getSession, getUserData } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { validateDecimal, normalizeDecimal } from "@/lib/validators";

const getProductsSchema = z.object({
    search: z
        .string()
        .max(100, "O campo de busca deve ter no máximo 100 caracteres")
        .trim()
        .nullable(),
    categoryId: z
        .string("ID da categoria inválida")
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

const postProductSchema = z.object({
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

export async function GET(request: NextRequest) {
    // Verify if the user is authenticated
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    // Verify if the user exists in the database
    const user = await getUserData()
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    // Get params
    const { searchParams } = new URL(request.url)

    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId") || "all"
    const limit = searchParams.get("limit") || "10"
    const page = searchParams.get("page") || "1"
    const getAll = searchParams.get("getAll") === "true"

    // Validate params
    const { data: params, success: paramsSuccess, error: paramsError } = getProductsSchema.safeParse({ search, categoryId, limit, page, getAll })
    if (!paramsSuccess) {
        const errorMessages = paramsError.issues.map((issue) => {
            const field = issue.path.join(".")
            return `${field ? `${field}: ` : ""}${issue.message}`
        })
        return NextResponse.json({ error: "Parâmetros inválidos", details: errorMessages }, { status: 400 })
    }

    // Build where clause
    const where: Prisma.ProductsWhereInput = {
        userId: user.id,
    }

    // If search is provided, add it to the where clause
    if (params.search) {
        where.name = {
            contains: params.search,
        }
    }

    // If categoryId is provided, check if it is a valid category and belongs to the user
    if (params.categoryId && params.categoryId !== "all") {
        try {
            const category = await prisma.categories.findFirst({ where: { id: params.categoryId, userId: user.id } })
            if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
        } catch (error) {
            console.error("Error while checking if the category exists and belongs to the user: ", error);
            return NextResponse.json({ error: "Erro interno ao verificar se a categoria existe e pertence ao usuário" }, { status: 500 })
        }
        where.categoryId = params.categoryId
    }

    // Build order by clause
    const orderBy: Prisma.ProductsOrderByWithRelationInput = {
        name: "asc",
    }

    // Create computed values
    const skip = params.getAll ? undefined : (params.page - 1) * params.limit
    const take = params.getAll ? undefined : params.limit

    // Try to get the products and total number of products
    let products
    let total: number
    try {
        [products, total] = await Promise.all([
            prisma.products.findMany({ where, skip, take, orderBy }),
            prisma.products.count({ where }),
        ])
    } catch (error) {
        console.error("Error while fetching products: ", error);
        return NextResponse.json({ error: "Erro interno ao buscar produtos" }, { status: 500 })
    }

    return NextResponse.json({
        data: products,
        total,
    }, { status: 200 })
}

export async function POST(request: NextRequest) {
    // Verify if the user is authenticated
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    // Verify if the user exists in the database
    const user = await getUserData()
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })

    // Validate the request body
    const { data: body, success: bodySuccess, error: bodyError } = postProductSchema.safeParse(await request.json())
    if (!bodySuccess) {
        const errorMessages = bodyError.issues.map((issue) => {
            const field = issue.path.join(".")
            return `${field ? `${field}: ` : ""}${issue.message}`
        })
        return NextResponse.json({ error: "Dados inválidos", details: errorMessages }, { status: 400 })
    }

    // Check if the category exists and belongs to the user
    try {
        const category = await prisma.categories.findFirst({ where: { id: body.categoryId, userId: user.id } })
        if (!category) return NextResponse.json({ error: "Categoria não encontrada" }, { status: 404 })
    } catch (error) {
        console.error("Error while checking if the category exists and belongs to the user: ", error);
        return NextResponse.json({ error: "Erro interno ao verificar se a categoria existe e pertence ao usuário" }, { status: 500 })
    }

    // Create the product
    let newProduct
    try {
        newProduct = await prisma.products.create({
            data: {
                userId: user.id,
                categoryId: body.categoryId,
                name: body.name,
                description: body.description,
                unitCost: new Prisma.Decimal(body.unitCost as string),
                unitPrice: new Prisma.Decimal(body.unitPrice as string),
                isActive: body.isActive,
            },
        })
    } catch (error) {
        console.error("Error while creating the product: ", error);
        return NextResponse.json({ error: "Erro interno ao criar o produto" }, { status: 500 })
    }

    return NextResponse.json({
        data: newProduct,
    }, { status: 201 })
}