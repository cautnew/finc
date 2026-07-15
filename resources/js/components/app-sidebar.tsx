import { Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BookOpen,
    CreditCard,
    FolderGit2,
    Layers,
    LayoutGrid,
    Repeat,
    Tag,
    TrendingUp,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as analyticsIndex } from '@/routes/analytics';
import { index as categoriesIndex } from '@/routes/categories';
import { index as installmentPlansIndex } from '@/routes/installment-plans';
import { index as paymentMethodsIndex } from '@/routes/payment-methods';
import { index as recurringTransactionsIndex } from '@/routes/recurring-transactions';
import { index as transactionsIndex } from '@/routes/transactions';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Transações',
        href: transactionsIndex(),
        icon: ArrowLeftRight,
    },
    {
        title: 'Categorias',
        href: categoriesIndex(),
        icon: Tag,
    },
    {
        title: 'Formas de pagamento',
        href: paymentMethodsIndex(),
        icon: CreditCard,
    },
    {
        title: 'Recorrências',
        href: recurringTransactionsIndex(),
        icon: Repeat,
    },
    {
        title: 'Parcelamentos',
        href: installmentPlansIndex(),
        icon: Layers,
    },
    {
        title: 'Análises',
        href: analyticsIndex(),
        icon: TrendingUp,
    },
];

const footerNavItems: NavItem[] = [
    /*{
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },*/
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
