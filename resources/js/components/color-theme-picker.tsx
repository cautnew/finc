import { Form, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import type { HTMLAttributes } from 'react';
import ThemeController from '@/actions/App/Http/Controllers/Settings/ThemeController';
import { cn } from '@/lib/utils';
import type { Auth, ColorTheme } from '@/types';

const themes: { value: ColorTheme; label: string; swatch: string }[] = [
    { value: 'rosa', label: 'Rosa', swatch: 'oklch(0.55 0.22 350)' },
    { value: 'azul', label: 'Azul', swatch: 'oklch(0.55 0.2 255)' },
    { value: 'roxo', label: 'Roxo', swatch: 'oklch(0.5 0.22 300)' },
    { value: 'verde', label: 'Verde', swatch: 'oklch(0.55 0.16 150)' },
    { value: 'vermelho', label: 'Vermelho', swatch: 'oklch(0.55 0.22 25)' },
    { value: 'cinza', label: 'Cinza', swatch: 'oklch(0.45 0.02 255)' },
    { value: 'preto', label: 'Preto', swatch: 'oklch(0.205 0 0)' },
    { value: 'branco', label: 'Branco', swatch: 'oklch(0.985 0 0)' },
];

export default function ColorThemePicker({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <div
            className={cn('grid grid-cols-4 gap-3 sm:grid-cols-8', className)}
            {...props}
        >
            {themes.map(({ value, label, swatch }) => (
                <Form
                    key={value}
                    {...ThemeController.update.form()}
                    options={{ preserveScroll: true }}
                >
                    <input type="hidden" name="theme" value={value} />
                    <button
                        type="submit"
                        title={label}
                        aria-label={label}
                        className="flex flex-col items-center gap-1.5"
                    >
                        <span
                            className="flex size-9 items-center justify-center rounded-full border border-border shadow-xs"
                            style={{ backgroundColor: swatch }}
                        >
                            {auth.user.theme === value && (
                                <Check className="size-4 text-white mix-blend-difference" />
                            )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {label}
                        </span>
                    </button>
                </Form>
            ))}
        </div>
    );
}
