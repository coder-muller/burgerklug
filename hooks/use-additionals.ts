import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useState } from "react"
import { Additionals } from "@/lib/generated/prisma/client"

// Request types
export type GetAdditionalsRequest = {
    params: {
        search?: string
        categoryId?: string
        limit: number
        page: number
        getAll?: boolean
    },
}

export type PostAdditionalsRequest = {
    body: {
        categoryId: string
        description: string
        additionalPrice: string
    }
}

export type PatchAdditionalsRequest = {
    params: {
        additionalId: string
    }
    body: {
        categoryId: string
        description: string
        additionalPrice: string
    }
}

export type DeleteAdditionalsRequest = {
    params: {
        additionalId: string
    }
}

// Response types
export type GetAdditionalsResponse = {
    data: Additionals[]
    total: number
}

export type PostAdditionalsResponse = {
    data: Additionals
}

export type PatchAdditionalsResponse = {
    data: Additionals
}

export type DeleteAdditionalsResponse = {
    data: {
        message: string
    }
}

// API functions
const getAdditionalsApi = async (request: GetAdditionalsRequest) => {
    const response = await api.get("/additionals", { params: request.params })
    return response.data
}

const postAdditionalsApi = async (request: PostAdditionalsRequest) => {
    const response = await api.post("/additionals", request.body)
    return response.data
}

const patchAdditionalsApi = async (request: PatchAdditionalsRequest) => {
    const response = await api.patch(`/additionals/${request.params.additionalId}`, request.body)
    return response.data
}

const deleteAdditionalsApi = async (request: DeleteAdditionalsRequest) => {
    const response = await api.delete(`/additionals/${request.params.additionalId}`)
    return response.data
}

// Hooks
export const useAdditionals = (getAll: boolean = false) => {
    // Query Client
    const queryClient = useQueryClient()

    // States
    const [search, setSearch] = useState("")
    const [categoryId, setCategoryId] = useState<string>("all")
    const [limit, setLimit] = useState(10)
    const [page, setPage] = useState(1)

    // Queries
    const { data: additionals, isLoading: isLoadingAdditionals, error: errorLoadingAdditionals, refetch: refetchAdditionals } = useQuery({
        queryKey: ["additionals", search, categoryId],
        queryFn: () => getAdditionalsApi({ params: { search, categoryId, limit, page, getAll } }),
        enabled: true,
        gcTime: 0,
        staleTime: 0,
    })

    // Mutations
    const { mutateAsync: createAdditional, isPending: isLoadingCreateAdditional, error: errorCreatingAdditional } = useMutation({
        mutationFn: (request: PostAdditionalsRequest) => postAdditionalsApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["additionals"] })
        },
    })

    const { mutateAsync: updateAdditional, isPending: isLoadingUpdateAdditional, error: errorUpdatingAdditional } = useMutation({
        mutationFn: (request: PatchAdditionalsRequest) => patchAdditionalsApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["additionals"] })
            queryClient.invalidateQueries({ queryKey: ["products"] })
        },
    })

    const { mutateAsync: deleteAdditional, isPending: isLoadingDeleteAdditional, error: errorDeletingAdditional } = useMutation({
        mutationFn: (request: DeleteAdditionalsRequest) => deleteAdditionalsApi(request),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["additionals"] })
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
    const hasAdditionals = additionals?.data.length > 0
    const hasNextPage = additionals?.total > page * limit
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
        additionals,
        isLoadingAdditionals,
        errorLoadingAdditionals,
        refetchAdditionals,

        // Post Mutations
        createAdditional,
        isLoadingCreateAdditional,
        errorCreatingAdditional,

        // Update Mutations
        updateAdditional,
        isLoadingUpdateAdditional,
        errorUpdatingAdditional,

        // Delete Mutations
        deleteAdditional,
        isLoadingDeleteAdditional,
        errorDeletingAdditional,

        // Computed values
        hasAdditionals,
        hasNextPage,
        hasPreviousPage,
    }
}
