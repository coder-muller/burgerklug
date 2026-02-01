import { NextResponse, NextRequest } from "next/server";
import { getSession, getUserData } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { validateDecimal, normalizeDecimal } from "@/lib/validators";

const getAdditionalsSchema = z.object({
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

const postAdditionalSchema = z.object({
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
    const { data: params, success: paramsSuccess, error: paramsError } = getAdditionalsSchema.safeParse({ search, categoryId, limit, page, getAll })
    if (!paramsSuccess) {
        const errorMessages = paramsError.issues.map((issue) => {
            const field = issue.path.join(".")
            return `${field ? `${field}: ` : ""}${issue.message}`
        })
        return NextResponse.json({ error: "Parâmetros inválidos", details: errorMessages }, { status: 400 })
    }

    // Build where clause
    const where: Prisma.AdditionalsWhereInput = {
        userId: user.id,
    }

    // If search is provided, add it to the where clause
    if (params.search) {
        where.description = {
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
    const orderBy: Prisma.AdditionalsOrderByWithRelationInput = {
        description: "asc",
    }

    // Create computed values
    const skip = params.getAll ? undefined : (params.page - 1) * params.limit
    const take = params.getAll ? undefined : params.limit

    // Try to get the additionals and total number of additionals
    let additionals
    let total: number
    try {
        [additionals, total] = await Promise.all([
            prisma.additionals.findMany({ where, skip, take, orderBy }),
            prisma.additionals.count({ where }),
        ])
    } catch (error) {
        console.error("Error while fetching additionals: ", error);
        return NextResponse.json({ error: "Erro interno ao buscar adicionais" }, { status: 500 })
    }

    return NextResponse.json({
        data: additionals,
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
    const { data: body, success: bodySuccess, error: bodyError } = postAdditionalSchema.safeParse(await request.json())
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

    // Create the additional
    let newAdditional
    try {
        newAdditional = await prisma.additionals.create({
            data: {
                userId: user.id,
                categoryId: body.categoryId,
                description: body.description,
                additionalPrice: new Prisma.Decimal(body.additionalPrice as string),
            },
        })
    } catch (error) {
        console.error("Error while creating the additional: ", error);
        return NextResponse.json({ error: "Erro interno ao criar o adicional" }, { status: 500 })
    }

    return NextResponse.json({
        data: newAdditional,
    }, { status: 201 })
}