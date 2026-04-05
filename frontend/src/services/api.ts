
const API_URL = 'https://dashboard-finanzas-api.onrender.com';

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };


    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });


    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ocurrió un error en el servidor');
    }


    return response.json();
};