import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import ColorThemePicker from '@/components/color-theme-picker';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Appearance settings" />

            <h1 className="sr-only">Appearance settings</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Appearance settings"
                    description="Update the appearance settings for your account"
                />
                <AppearanceTabs />

                <Heading
                    variant="small"
                    title="Cor do tema"
                    description="Escolha a cor de destaque usada em toda a aplicação"
                />
                <ColorThemePicker />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Appearance settings',
            href: editAppearance(),
        },
    ],
};
