import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useState } from "react"
import { Products } from "@/lib/generated/prisma/client"

// Request types
export type GetProductsRequest = {
    params: {
        search?: string
        categoryId?: string
        limit: number
        page: number
        getAll?: boolean
    },
}

export type PostProductsRequest = {
    body: {
        categoryId: string
        name: string
        description?: string
        unitCost: string
        unitPrice: string
        isActive: boolean
    }
}

export type PatchProductsRequest = {
    params: {
        productId: string
    }
    body: {
        categoryId: string
        name: string
        description?: string
        unitCost: string
        unitPrice: string
        isActive: boolean
    }
}

export type DeleteProductsRequest = {
    params: {
        productId: string
    }
}

// Response types
export type GetProductsResponse = {
    data: Products[]
    total: number
}

export type PostProductsResponse = {
    data: Products
}

export type PatchProductsResponse = {
    data: Products
}

export type DeleteProductsResponse = {
    data: {
        message: string
    }
}

// API functions
const getProductsApi = async (request: GetProductsRequest) => {
    const response = await api.get("/products", { params: request.params })
    return response.data
}

const postProductsApi = async (request: PostProductsRequest) => {
    const response = await api.post("/products", request.body)
    return response.data
}

const patchProductsApi = async (request: PatchProductsRequest) => {
    const response = await api.patch(`/products/${request.params.productId}`, request.body)
    return response.data
}

const deleteProductsApi = async (request: DeleteProductsRequest) => {
    const response = await api.delete(`/products/${request.params.productId}`)
    return response.data
}

// Hooks
export const useProducts = (getAll: boolean = false) => {
    // Query Client
    const queryClient = useQueryClient()

    // States
    const [search, setSearch] = useState<string>("")
    const [categoryId, setCategoryId] = useState<string>("all")
    const [limit, setLimit] = useState<number>(10)
    const [page, setPage] = useState<number>(1)

    // Queries
    const { data: products, isLoading: isLoadingProducts, error: errorLoadingProducts, refetch: refetchProducts } = useQuery({
        queryKey: ["products", search, categoryId],
        queryFn: () => getProductsApi({ params: { search, categoryId, limit, page, getAll } }),
        enabled: true,
        gcTime: 0,
        staleTime: 0,
    })

    // Mutations
    const { mutateAsync: createProduct, isPending: isLoadingCreateProduct, error: errorCreatingProduct } = useMutation({
        mutationFn: (request: PostProductsRequest) => postProductsApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })

    const { mutateAsync: updateProduct, isPending: isLoadingUpdateProduct, error: errorUpdatingProduct } = useMutation({
        mutationFn: (request: PatchProductsRequest) => patchProductsApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })

    const { mutateAsync: deleteProduct, isPending: isLoadingDeleteProduct, error: errorDeletingProduct } = useMutation({
        mutationFn: (request: DeleteProductsRequest) => deleteProductsApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })

    // Handlers
    const handleSearch = (search: string) => {
        setSearch(search)
    }

    const handleCategoryId = (categoryId: string) => {
        setCategoryId(categoryId)
    }

    const handleLimit = (limit: number) => {
        setLimit(limit)
    }

    const handlePage = (page: number) => {
        setPage(page)
    }

    // Computed values
    const hasProducts = products?.data.length > 0
    const hasNextPage = products?.total > page * limit
    const hasPreviousPage = page > 1

    return {
        // States
        search,
        categoryId,
        limit,
        page,

        // Handlers
        setSearch: handleSearch,
        setCategoryId: handleCategoryId,
        setLimit: handleLimit,
        setPage: handlePage,

        // Queries
        products,
        isLoadingProducts,
        errorLoadingProducts,
        refetchProducts,

        // Post Mutations
        createProduct,
        isLoadingCreateProduct,
        errorCreatingProduct,

        // Update Mutations
        updateProduct,
        isLoadingUpdateProduct,
        errorUpdatingProduct,

        // Delete Mutations
        deleteProduct,
        isLoadingDeleteProduct,
        errorDeletingProduct,

        // Computed values
        hasProducts,
        hasNextPage,
        hasPreviousPage,
    }
}
