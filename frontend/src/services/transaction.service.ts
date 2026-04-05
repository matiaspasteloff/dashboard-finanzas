import { fetchAPI } from './api';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    categoryId: string;
    userId: string;
    isRecurring: boolean;
    recurrenceFrequency: string | null;
}

export interface PaginatedTransactions {
    data: Transaction[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface TransactionFilters {
    page?: number;
    limit?: number;
    month?: number;
    year?: number;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    search?: string;
    type?: 'INCOME' | 'EXPENSE';
}

const buildQuery = (params: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
        if (val != null && val !== '') p.append(key, String(val));
    }
    return p.toString() ? `?${p.toString()}` : '';
};

export const transactionService = {
    // Returns array — used by dashboard and budget page
    getAll: async (filters?: Omit<TransactionFilters, 'page' | 'limit'>): Promise<Transaction[]> => {
        const query = buildQuery({ ...filters });
        return fetchAPI(`/transactions${query}`);
    },

    // Returns paginated object — used by transactions page
    getPaginated: async (filters: TransactionFilters): Promise<PaginatedTransactions> => {
        const query = buildQuery({ page: 1, limit: 20, ...filters });
        return fetchAPI(`/transactions${query}`);
    },

    create: async (data: {
        amount: number;
        description: string;
        categoryId: string;
        isRecurring?: boolean;
        recurrenceFrequency?: string;
    }): Promise<Transaction> => {
        return fetchAPI('/transactions', { method: 'POST', body: JSON.stringify(data) });
    },

    delete: async (id: string): Promise<{ message: string }> => {
        return fetchAPI(`/transactions/${id}`, { method: 'DELETE' });
    },
};