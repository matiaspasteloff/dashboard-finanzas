import { fetchAPI } from './api';
import type { Category } from './category.service';

export interface Budget {
    id: string;
    amount: number;
    month: number;
    year: number;
    categoryId: string;
    userId: string;
    category: Category;
}

export const budgetService = {
    getAll: async (month?: number, year?: number): Promise<Budget[]> => {
        const params = new URLSearchParams();
        if (month != null) params.append('month', String(month));
        if (year != null) params.append('year', String(year));
        const query = params.toString() ? `?${params.toString()}` : '';
        return fetchAPI(`/budgets${query}`);
    },

    upsert: async (data: { categoryId: string; amount: number; month: number; year: number }): Promise<Budget> => {
        return fetchAPI('/budgets', { method: 'POST', body: JSON.stringify(data) });
    },

    delete: async (id: string): Promise<{ message: string }> => {
        return fetchAPI(`/budgets/${id}`, { method: 'DELETE' });
    },
};