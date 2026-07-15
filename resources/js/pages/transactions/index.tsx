import { Form, Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import TransactionController from '@/actions/App/Http/Controllers/Finance/TransactionController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { index as transactionsIndex } from '@/routes/transactions';
import type {
    BreadcrumbItem,
    Category,
    Paginated,
    PaymentMethod,
    Transaction,
} from '@/types';

type Filters = {
    type?: string;
    category_id?: string;
    payment_method_id?: string;
    from?: string;
    to?: string;
    search?: string;
};

const formatCurrency = (value: string) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(value));

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
        new Date(`${value}T00:00:00Z`),
    );

export default function TransactionsIndex({
    transactions,
    categories,
    paymentMethods,
    filters,
}: {
    transactions: Paginated<Transaction>;
    categories: Category[];
    paymentMethods: PaymentMethod[];
    filters: Filters;
}) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Transaction | null>(null);
    const [isRecurring, setIsRecurring] = useState(false);
    const [isInstallment, setIsInstallment] = useState(false);
    const [filterState, setFilterState] = useState<Filters>(filters);

    const applyFilters = () => {
        router.get(transactionsIndex().url, filterState, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setFilterState({});
        router.get(
            transactionsIndex().url,
            {},
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        setEditing(null);
        setIsRecurring(false);
        setIsInstallment(false);
        setOpen(true);
    };

    const openEdit = (transaction: Transaction) => {
        setEditing(transaction);
        setIsRecurring(false);
        setIsInstallment(false);
        setOpen(true);
    };

    return (
        <>
            <Head title="Transações" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Transações"
                        description="Receitas e despesas da sua conta"
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>
                                <Plus />
                                Nova transação
                            </Button>
                        </DialogTrigger>
                        <DialogContent
                            key={editing?.id ?? 'new'}
                            className="sm:max-w-xl"
                        >
                            <DialogHeader>
                                <DialogTitle>
                                    {editing
                                        ? 'Editar transação'
                                        : 'Nova transação'}
                                </DialogTitle>
                            </DialogHeader>

                            <Form
                                {...(editing
                                    ? TransactionController.update.form(
                                          editing.id,
                                      )
                                    : TransactionController.store.form())}
                                options={{ preserveScroll: true }}
                                transform={(data) => ({
                                    ...data,
                                    category_id:
                                        data.category_id === 'none'
                                            ? null
                                            : data.category_id,
                                    payment_method_id:
                                        data.payment_method_id === 'none'
                                            ? null
                                            : data.payment_method_id,
                                })}
                                onSuccess={() => setOpen(false)}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="type">
                                                    Tipo
                                                </Label>
                                                <Select
                                                    name="type"
                                                    defaultValue={
                                                        editing?.type ??
                                                        'expense'
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="type"
                                                        className="w-full"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="income">
                                                            Receita
                                                        </SelectItem>
                                                        <SelectItem value="expense">
                                                            Despesa
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={errors.type}
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="amount">
                                                    {isInstallment
                                                        ? 'Valor total da compra'
                                                        : 'Valor'}
                                                </Label>
                                                <Input
                                                    id="amount"
                                                    type="number"
                                                    step="0.01"
                                                    min="0.01"
                                                    name="amount"
                                                    required
                                                    defaultValue={
                                                        editing?.amount
                                                    }
                                                />
                                                <InputError
                                                    message={errors.amount}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="transaction_date">
                                                    Data
                                                </Label>
                                                <Input
                                                    id="transaction_date"
                                                    type="date"
                                                    name="transaction_date"
                                                    required
                                                    defaultValue={
                                                        editing?.transaction_date
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        errors.transaction_date
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="due_date">
                                                    Vencimento (opcional)
                                                </Label>
                                                <Input
                                                    id="due_date"
                                                    type="date"
                                                    name="due_date"
                                                    defaultValue={
                                                        editing?.due_date ??
                                                        undefined
                                                    }
                                                />
                                                <InputError
                                                    message={errors.due_date}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="category_id">
                                                    Categoria
                                                </Label>
                                                <Select
                                                    name="category_id"
                                                    defaultValue={
                                                        editing?.category
                                                            ? String(
                                                                  editing
                                                                      .category
                                                                      .id,
                                                              )
                                                            : 'none'
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="category_id"
                                                        className="w-full"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Sem categoria
                                                        </SelectItem>
                                                        {categories.map(
                                                            (category) => (
                                                                <SelectItem
                                                                    key={
                                                                        category.id
                                                                    }
                                                                    value={String(
                                                                        category.id,
                                                                    )}
                                                                >
                                                                    {
                                                                        category.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        errors.category_id
                                                    }
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="payment_method_id">
                                                    Forma de pagamento
                                                </Label>
                                                <Select
                                                    name="payment_method_id"
                                                    defaultValue={
                                                        editing?.payment_method
                                                            ? String(
                                                                  editing
                                                                      .payment_method
                                                                      .id,
                                                              )
                                                            : 'none'
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="payment_method_id"
                                                        className="w-full"
                                                    >
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="none">
                                                            Nenhuma
                                                        </SelectItem>
                                                        {paymentMethods.map(
                                                            (
                                                                paymentMethod,
                                                            ) => (
                                                                <SelectItem
                                                                    key={
                                                                        paymentMethod.id
                                                                    }
                                                                    value={String(
                                                                        paymentMethod.id,
                                                                    )}
                                                                >
                                                                    {
                                                                        paymentMethod.name
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        errors.payment_method_id
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="description">
                                                Descrição
                                            </Label>
                                            <Input
                                                id="description"
                                                name="description"
                                                defaultValue={
                                                    editing?.description ??
                                                    undefined
                                                }
                                            />
                                            <InputError
                                                message={errors.description}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="notes">
                                                Observações
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                name="notes"
                                                placeholder="Anotações sobre este lançamento..."
                                                defaultValue={
                                                    editing?.notes ??
                                                    undefined
                                                }
                                            />
                                            <InputError
                                                message={errors.notes}
                                            />
                                        </div>

                                        {editing ? (
                                            <>
                                                {editing.is_recurring && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Esta transação foi
                                                        gerada por uma
                                                        recorrência. A edição
                                                        altera apenas esta
                                                        ocorrência.
                                                    </p>
                                                )}
                                                {editing.is_installment && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Esta transação é a
                                                        parcela{' '}
                                                        {
                                                            editing.installment_number
                                                        }
                                                        /
                                                        {
                                                            editing.installments_total
                                                        }{' '}
                                                        de um parcelamento.
                                                        Para editar o valor
                                                        total ou o número de
                                                        parcelas, use a página
                                                        Parcelamentos.
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <div className="space-y-4 rounded-lg border p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="is_recurring"
                                                            name="is_recurring"
                                                            value="1"
                                                            checked={
                                                                isRecurring
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                const value =
                                                                    checked ===
                                                                    true;
                                                                setIsRecurring(
                                                                    value,
                                                                );
                                                                if (value) {
                                                                    setIsInstallment(
                                                                        false,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor="is_recurring">
                                                            Transação
                                                            recorrente
                                                        </Label>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="is_installment"
                                                            name="is_installment"
                                                            value="1"
                                                            checked={
                                                                isInstallment
                                                            }
                                                            onCheckedChange={(
                                                                checked,
                                                            ) => {
                                                                const value =
                                                                    checked ===
                                                                    true;
                                                                setIsInstallment(
                                                                    value,
                                                                );
                                                                if (value) {
                                                                    setIsRecurring(
                                                                        false,
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor="is_installment">
                                                            Compra parcelada
                                                        </Label>
                                                    </div>
                                                </div>

                                                {isRecurring && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="frequency">
                                                                Periodicidade
                                                            </Label>
                                                            <Select
                                                                name="frequency"
                                                                defaultValue="monthly"
                                                            >
                                                                <SelectTrigger
                                                                    id="frequency"
                                                                    className="w-full"
                                                                >
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="daily">
                                                                        Diário
                                                                    </SelectItem>
                                                                    <SelectItem value="weekly">
                                                                        Semanal
                                                                    </SelectItem>
                                                                    <SelectItem value="monthly">
                                                                        Mensal
                                                                    </SelectItem>
                                                                    <SelectItem value="yearly">
                                                                        Anual
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <InputError
                                                                message={
                                                                    errors.frequency
                                                                }
                                                            />
                                                        </div>

                                                        <div className="grid gap-2">
                                                            <Label htmlFor="end_date">
                                                                Repetir até
                                                                (opcional)
                                                            </Label>
                                                            <Input
                                                                id="end_date"
                                                                type="date"
                                                                name="end_date"
                                                            />
                                                            <InputError
                                                                message={
                                                                    errors.end_date
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                )}

                                                {isInstallment && (
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="installments_total">
                                                            Número de parcelas
                                                        </Label>
                                                        <Input
                                                            id="installments_total"
                                                            type="number"
                                                            step="1"
                                                            min="2"
                                                            max="60"
                                                            name="installments_total"
                                                            required
                                                            defaultValue={2}
                                                        />
                                                        <InputError
                                                            message={
                                                                errors.installments_total
                                                            }
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <DialogFooter>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                Salvar
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )}
                            </Form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-wrap items-end gap-3 rounded-xl border p-4">
                    <div className="grid gap-1.5">
                        <Label htmlFor="filter-search">Busca</Label>
                        <Input
                            id="filter-search"
                            placeholder="Descrição..."
                            value={filterState.search ?? ''}
                            onChange={(e) =>
                                setFilterState((s) => ({
                                    ...s,
                                    search: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="filter-type">Tipo</Label>
                        <Select
                            value={filterState.type ?? 'all'}
                            onValueChange={(value) =>
                                setFilterState((s) => ({
                                    ...s,
                                    type: value === 'all' ? undefined : value,
                                }))
                            }
                        >
                            <SelectTrigger id="filter-type" className="w-36">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="income">Receita</SelectItem>
                                <SelectItem value="expense">
                                    Despesa
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="filter-category">Categoria</Label>
                        <Select
                            value={filterState.category_id ?? 'all'}
                            onValueChange={(value) =>
                                setFilterState((s) => ({
                                    ...s,
                                    category_id:
                                        value === 'all' ? undefined : value,
                                }))
                            }
                        >
                            <SelectTrigger
                                id="filter-category"
                                className="w-40"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={String(category.id)}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="filter-payment-method">
                            Forma de pagamento
                        </Label>
                        <Select
                            value={filterState.payment_method_id ?? 'all'}
                            onValueChange={(value) =>
                                setFilterState((s) => ({
                                    ...s,
                                    payment_method_id:
                                        value === 'all' ? undefined : value,
                                }))
                            }
                        >
                            <SelectTrigger
                                id="filter-payment-method"
                                className="w-44"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {paymentMethods.map((paymentMethod) => (
                                    <SelectItem
                                        key={paymentMethod.id}
                                        value={String(paymentMethod.id)}
                                    >
                                        {paymentMethod.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="filter-from">De</Label>
                        <Input
                            id="filter-from"
                            type="date"
                            value={filterState.from ?? ''}
                            onChange={(e) =>
                                setFilterState((s) => ({
                                    ...s,
                                    from: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div className="grid gap-1.5">
                        <Label htmlFor="filter-to">Até</Label>
                        <Input
                            id="filter-to"
                            type="date"
                            value={filterState.to ?? ''}
                            onChange={(e) =>
                                setFilterState((s) => ({
                                    ...s,
                                    to: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <Button variant="secondary" onClick={applyFilters}>
                        Filtrar
                    </Button>
                    <Button variant="ghost" onClick={clearFilters}>
                        Limpar
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 font-medium">
                                    Data
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Descrição
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Categoria
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Pagamento
                                </th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Valor
                                </th>
                                <th className="w-24 px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Nenhuma transação encontrada.
                                    </td>
                                </tr>
                            )}
                            {transactions.data.map((transaction) => (
                                <tr
                                    key={transaction.id}
                                    className="border-t"
                                >
                                    <td className="px-4 py-2">
                                        {formatDate(transaction.transaction_date)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-2">
                                            {transaction.description ?? '—'}
                                            {transaction.is_recurring && (
                                                <Badge variant="outline">
                                                    Recorrente
                                                </Badge>
                                            )}
                                            {transaction.is_installment && (
                                                <Badge variant="outline">
                                                    Parcela{' '}
                                                    {
                                                        transaction.installment_number
                                                    }
                                                    /
                                                    {
                                                        transaction.installments_total
                                                    }
                                                </Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">
                                        {transaction.category?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {transaction.payment_method?.name ??
                                            '—'}
                                    </td>
                                    <td
                                        className={`px-4 py-2 text-right font-medium ${
                                            transaction.type === 'income'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-destructive'
                                        }`}
                                    >
                                        {transaction.type === 'income'
                                            ? '+'
                                            : '-'}
                                        {formatCurrency(transaction.amount)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEdit(transaction)
                                                }
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Form
                                                {...TransactionController.destroy.form(
                                                    transaction.id,
                                                )}
                                                onBefore={() =>
                                                    confirm(
                                                        'Excluir esta transação?',
                                                    )
                                                }
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                >
                                                    <Trash2 className="size-4 text-destructive" />
                                                </Button>
                                            </Form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {transactions.last_page > 1 && (
                    <div className="flex flex-wrap gap-1">
                        {transactions.links.map((link, linkIndex) => (
                            <Link
                                key={linkIndex}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`rounded-md px-3 py-1 text-sm ${
                                    link.active
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:bg-accent'
                                } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

TransactionsIndex.layout = {
    breadcrumbs: [
        { title: 'Transações', href: transactionsIndex() },
    ] satisfies BreadcrumbItem[],
};
