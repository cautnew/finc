import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { Auth } from '@/types';

export function useSyncColorTheme(): void {
    const { auth } = usePage<{ auth: Auth }>().props;

    useEffect(() => {
        document.documentElement.dataset.theme = auth.user.theme;
    }, [auth.user.theme]);
}
