import { fetchAPI } from './api';

export interface Category {
    id: string;
    name: string;
    type: 'INCOME' | 'EXPENSE';
    userId: string;
    createdAt: string;
}

export const categoryService = {

    getAll: async (): Promise<Category[]> => {
        return fetchAPI('/categories'); 
    },

    create: async (data: { name: string; type: 'INCOME' | 'EXPENSE' }): Promise<Category> => {
        return fetchAPI('/categories', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
};