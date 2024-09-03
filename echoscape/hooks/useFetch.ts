import useSwr from 'swr';
import { useAuth } from '@/utils/auth/AuthProvider';

export const useFetch = (url: string) => {
    const { withAuthFetch } = useAuth();
    const { data, isLoading, error } = useSwr(
        `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}${url}`,
        (url) => withAuthFetch(url).then((res) => res.json())
    );

    return {
        data,
        isLoading,
        error,
    };
};