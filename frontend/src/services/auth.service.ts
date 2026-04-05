import { fetchAPI } from './api';

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export const authService = {
    register: async (data: any): Promise<AuthResponse> => {
        return fetchAPI('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    login: async (data: any): Promise<AuthResponse> => {
        return fetchAPI('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};