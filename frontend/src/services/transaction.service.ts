import { fetchAPI } from './api';

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    categoryId: string;
    userId: string;
    createdAt: string;
}

export const transactionService = {
    getAll: async (): Promise<Transaction[]> => {
        return fetchAPI('/transactions');
    },


    create: async (data: { amount: number; description: string; categoryId: string }): Promise<Transaction> => {
        return fetchAPI('/transactions', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string): Promise<{ message: string }> => {
        return fetchAPI(`/transactions/${id}`, {
            method: 'DELETE',
        });
    }
};