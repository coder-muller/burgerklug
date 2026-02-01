/**
 * Mapeamento de erros do Better Auth para mensagens em PT-BR
 */

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
    // Erros de autenticação
    "INVALID_EMAIL_OR_PASSWORD": "E-mail ou senha incorretos",
    "INVALID_PASSWORD": "Senha incorreta",
    "INVALID_EMAIL": "E-mail inválido",
    "INVALID_CREDENTIALS": "Credenciais inválidas",
    "USER_NOT_FOUND": "Usuário não encontrado",
    "INCORRECT_PASSWORD": "Senha incorreta",

    // Erros de registro
    "USER_ALREADY_EXISTS": "Este e-mail já está cadastrado",
    "EMAIL_ALREADY_EXISTS": "Este e-mail já está em uso",
    "EMAIL_ALREADY_IN_USE": "Este e-mail já está em uso",
    "USERNAME_ALREADY_EXISTS": "Este nome de usuário já existe",
    "ACCOUNT_ALREADY_EXISTS": "Já existe uma conta com estas credenciais",

    // Erros de validação
    "INVALID_EMAIL_FORMAT": "Formato de e-mail inválido",
    "WEAK_PASSWORD": "A senha é muito fraca",
    "PASSWORD_TOO_SHORT": "A senha deve ter no mínimo 8 caracteres",
    "PASSWORD_TOO_LONG": "A senha é muito longa",
    "PASSWORDS_DO_NOT_MATCH": "As senhas não coincidem",
    "MISSING_FIELDS": "Campos obrigatórios não preenchidos",
    "INVALID_INPUT": "Dados inválidos fornecidos",

    // Erros de sessão
    "SESSION_EXPIRED": "Sua sessão expirou. Faça login novamente",
    "INVALID_SESSION": "Sessão inválida",
    "NO_SESSION": "Nenhuma sessão ativa encontrada",
    "SESSION_NOT_FOUND": "Sessão não encontrada",
    "UNAUTHORIZED": "Não autorizado. Faça login para continuar",

    // Erros de token
    "INVALID_TOKEN": "Token inválido ou expirado",
    "TOKEN_EXPIRED": "Token expirado",
    "INVALID_VERIFICATION_TOKEN": "Token de verificação inválido",
    "INVALID_RESET_TOKEN": "Token de redefinição de senha inválido",
    "TOKEN_NOT_FOUND": "Token não encontrado",

    // Erros de verificação de e-mail
    "EMAIL_NOT_VERIFIED": "Por favor, verifique seu e-mail antes de continuar",
    "VERIFICATION_FAILED": "Falha na verificação do e-mail",
    "VERIFICATION_LINK_EXPIRED": "Link de verificação expirado",
    "EMAIL_ALREADY_VERIFIED": "Este e-mail já foi verificado",

    // Erros de redefinição de senha
    "INVALID_RESET_REQUEST": "Solicitação de redefinição inválida",
    "RESET_TOKEN_EXPIRED": "Token de redefinição expirado",
    "PASSWORD_RESET_FAILED": "Falha ao redefinir a senha",

    // Erros OAuth/Social Login
    "OAUTH_ERROR": "Erro ao autenticar com provedor externo",
    "OAUTH_ACCOUNT_NOT_LINKED": "Conta do provedor não vinculada",
    "OAUTH_CALLBACK_ERROR": "Erro no callback do OAuth",
    "PROVIDER_ERROR": "Erro no provedor de autenticação",
    "ACCOUNT_NOT_LINKED": "Conta não vinculada",

    // Erros de rate limit
    "TOO_MANY_REQUESTS": "Muitas tentativas. Tente novamente mais tarde",
    "RATE_LIMIT_EXCEEDED": "Limite de tentativas excedido",

    // Erros de two-factor
    "INVALID_2FA_CODE": "Código de autenticação inválido",
    "2FA_REQUIRED": "Autenticação de dois fatores necessária",
    "2FA_NOT_ENABLED": "Autenticação de dois fatores não está ativada",
    "2FA_ALREADY_ENABLED": "Autenticação de dois fatores já está ativada",

    // Erros gerais
    "INTERNAL_SERVER_ERROR": "Erro interno do servidor. Tente novamente",
    "NETWORK_ERROR": "Erro de conexão. Verifique sua internet",
    "UNKNOWN_ERROR": "Ocorreu um erro desconhecido",
    "FORBIDDEN": "Acesso negado",
    "NOT_FOUND": "Recurso não encontrado",
    "BAD_REQUEST": "Requisição inválida",
    "CONFLICT": "Conflito ao processar solicitação",

    // Erros de permissão
    "INSUFFICIENT_PERMISSIONS": "Permissões insuficientes",
    "ACCESS_DENIED": "Acesso negado",

    // Erros de conta
    "ACCOUNT_DISABLED": "Esta conta foi desativada",
    "ACCOUNT_LOCKED": "Esta conta foi bloqueada",
    "ACCOUNT_SUSPENDED": "Esta conta foi suspensa",
};

/**
 * Função para obter mensagem de erro em PT-BR
 */
export function getAuthErrorMessage(error: unknown): string {
    if (!error) {
        return "Ocorreu um erro desconhecido";
    }

    // Se é um objeto de erro
    if (typeof error === "object" && error !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = error as any;

        // Verifica se tem um código de erro
        if (err.code && AUTH_ERROR_MESSAGES[err.code]) {
            return AUTH_ERROR_MESSAGES[err.code];
        }

        // Verifica se tem um tipo de erro
        if (err.type && AUTH_ERROR_MESSAGES[err.type]) {
            return AUTH_ERROR_MESSAGES[err.type];
        }

        // Verifica propriedades comuns de erro
        if (err.message) {
            const message = err.message.toUpperCase().replace(/\s+/g, "_");
            if (AUTH_ERROR_MESSAGES[message]) {
                return AUTH_ERROR_MESSAGES[message];
            }

            // Tenta encontrar correspondência parcial
            for (const [key, value] of Object.entries(AUTH_ERROR_MESSAGES)) {
                if (err.message.toLowerCase().includes(key.toLowerCase().replace(/_/g, " "))) {
                    return value;
                }
            }
        }

        // Verifica se tem um status HTTP
        if (err.status === 401 || err.statusCode === 401) {
            return AUTH_ERROR_MESSAGES.UNAUTHORIZED;
        }
        if (err.status === 403 || err.statusCode === 403) {
            return AUTH_ERROR_MESSAGES.FORBIDDEN;
        }
        if (err.status === 404 || err.statusCode === 404) {
            return AUTH_ERROR_MESSAGES.NOT_FOUND;
        }
        if (err.status === 409 || err.statusCode === 409) {
            return AUTH_ERROR_MESSAGES.CONFLICT;
        }
        if (err.status === 429 || err.statusCode === 429) {
            return AUTH_ERROR_MESSAGES.TOO_MANY_REQUESTS;
        }
        if (err.status >= 500 || err.statusCode >= 500) {
            return AUTH_ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
        }
    }

    // Se é uma string
    if (typeof error === "string") {
        const errorKey = error.toUpperCase().replace(/\s+/g, "_");
        if (AUTH_ERROR_MESSAGES[errorKey]) {
            return AUTH_ERROR_MESSAGES[errorKey];
        }

        // Tenta encontrar correspondência parcial
        for (const [key, value] of Object.entries(AUTH_ERROR_MESSAGES)) {
            if (error.toLowerCase().includes(key.toLowerCase().replace(/_/g, " "))) {
                return value;
            }
        }
    }

    return "Ocorreu um erro. Tente novamente";
}

/**
 * Tipo para categorias de erro
 */
export type AuthErrorCategory =
    | "authentication"
    | "registration"
    | "validation"
    | "session"
    | "token"
    | "verification"
    | "oauth"
    | "rate_limit"
    | "2fa"
    | "general";

/**
 * Função para categorizar erros
 */
export function categorizeAuthError(error: unknown): AuthErrorCategory {
    const message = getAuthErrorMessage(error);

    if (message.includes("senha") || message.includes("credenciais")) {
        return "authentication";
    }
    if (message.includes("cadastrado") || message.includes("já existe")) {
        return "registration";
    }
    if (message.includes("inválido") || message.includes("formato")) {
        return "validation";
    }
    if (message.includes("sessão")) {
        return "session";
    }
    if (message.includes("token")) {
        return "token";
    }
    if (message.includes("verific")) {
        return "verification";
    }
    if (message.includes("provedor") || message.includes("OAuth")) {
        return "oauth";
    }
    if (message.includes("tentativas") || message.includes("limite")) {
        return "rate_limit";
    }
    if (message.includes("dois fatores") || message.includes("2FA")) {
        return "2fa";
    }

    return "general";
}

/**
 * Hook para usar em componentes React (opcional)
 */
export function useAuthError() {
    const formatError = (error: unknown) => {
        return {
            message: getAuthErrorMessage(error),
            category: categorizeAuthError(error),
        };
    };

    return { formatError, getAuthErrorMessage };
}