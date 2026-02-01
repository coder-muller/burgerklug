import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useState } from "react"
import { Categories } from "@/lib/generated/prisma/client"

// Request types
export type GetCategoriesRequest = {
    params: {
        search?: string
        limit: number
        page: number
        getAll?: boolean
    },
}

export type PostCategoriesRequest = {
    body: {
        name: string
    }
}

export type PatchCategoriesRequest = {
    params: {
        categoryId: string
    }
    body: {
        name: string
    }
}

export type DeleteCategoriesRequest = {
    params: {
        categoryId: string
    }
}

// Response types
export type GetCategoriesResponse = {
    data: Categories[]
    total: number
}

export type PostCategoriesResponse = {
    data: Categories
}

export type PatchCategoriesResponse = {
    data: Categories
}

export type DeleteCategoriesResponse = {
    message: string
}

// API functions
const getCategoriesApi = async (request: GetCategoriesRequest) => {
    const response = await api.get("/categories", { params: request.params })
    return response.data
}

const postCategoriesApi = async (request: PostCategoriesRequest) => {
    const response = await api.post("/categories", request.body)
    return response.data
}

const patchCategoriesApi = async (request: PatchCategoriesRequest) => {
    const response = await api.patch(`/categories/${request.params.categoryId}`, request.body)
    return response.data
}

const deleteCategoriesApi = async (request: DeleteCategoriesRequest) => {
    const response = await api.delete(`/categories/${request.params.categoryId}`)
    return response.data
}

// Hooks
export const useCategories = (getAll: boolean = false) => {
    // Query Client
    const queryClient = useQueryClient()

    // States
    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(10)
    const [page, setPage] = useState(1)

    // Queries
    const { data: categories, isLoading: isLoadingCategories, error: errorLoadingCategories, refetch: refetchCategories } = useQuery({
        queryKey: ["categories", search],
        queryFn: () => getCategoriesApi({ params: { search, limit, page, getAll } }),
        enabled: true,
        gcTime: 0,
        staleTime: 0,
    })

    // Mutations
    const { mutateAsync: createCategory, isPending: isLoadingCreateCategory, error: errorCreatingCategory } = useMutation({
        mutationFn: (request: PostCategoriesRequest) => postCategoriesApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
        },
    })

    const { mutateAsync: updateCategory, isPending: isLoadingUpdateCategory, error: errorUpdatingCategory } = useMutation({
        mutationFn: (request: PatchCategoriesRequest) => patchCategoriesApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["additionals"] })
        },
    })

    const { mutateAsync: deleteCategory, isPending: isLoadingDeleteCategory, error: errorDeletingCategory } = useMutation({
        mutationFn: (request: DeleteCategoriesRequest) => deleteCategoriesApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
            queryClient.invalidateQueries({ queryKey: ["additionals"] })
        },
    })

    // Handlers
    const handleSearch = (search: string) => {
        setSearch(search)
    }

    const handleLimit = (limit: number) => {
        setLimit(limit)
    }

    const handlePage = (page: number) => {
        setPage(page)
    }

    // Computed values
    const hasCategories = categories?.data.length > 0
    const hasNextPage = categories?.total > page * limit
    const hasPreviousPage = page > 1

    return {
        // States
        search,
        limit,
        page,

        // Handlers
        setSearch: handleSearch,
        setLimit: handleLimit,
        setPage: handlePage,

        // Queries
        categories,
        isLoadingCategories,
        errorLoadingCategories,
        refetchCategories,

        // Post Mutations
        createCategory,
        isLoadingCreateCategory,
        errorCreatingCategory,

        // Update Mutations
        updateCategory,
        isLoadingUpdateCategory,
        errorUpdatingCategory,

        // Delete Mutations
        deleteCategory,
        isLoadingDeleteCategory,
        errorDeletingCategory,

        // Computed values
        hasCategories,
        hasNextPage,
        hasPreviousPage,
    }
}