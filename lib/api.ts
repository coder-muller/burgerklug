import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const api = axios.create()

api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {

        console.log(JSON.stringify(error, null, 2))

        if (error instanceof AxiosError) {
            if (error.response?.data.details) {
                toast.error(error.response?.data.error || "Erro ao fazer a requisição", {
                    description: error.response?.data.details,
                })
            }
            toast.error(error.response?.data.error || "Erro ao fazer a requisição")
        } else {
            toast.error("Erro ao fazer a requisição")
        }
        return Promise.reject(error)
    }
)