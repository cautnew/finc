import { Form, Head } from '@inertiajs/react';
import { Pencil, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import RecurringTransactionController from '@/actions/App/Http/Controllers/Finance/RecurringTransactionController';
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
import { index as recurringTransactionsIndex } from '@/routes/recurring-transactions';
import type {
    BreadcrumbItem,
    Category,
    PaymentMethod,
    RecurringTransaction,
} from '@/types';

const frequencyLabels: Record<RecurringTransaction['frequency'], string> = {
    daily: 'Diário',
    weekly: 'Semanal',
    monthly: 'Mensal',
    yearly: 'Anual',
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

export default function RecurringTransactionsIndex({
    recurringTransactions,
    categories,
    paymentMethods,
}: {
    recurringTransactions: RecurringTransaction[];
    categories: Category[];
    paymentMethods: PaymentMethod[];
}) {
    const [editing, setEditing] = useState<RecurringTransaction | null>(null);
    const [launching, setLaunching] = useState<RecurringTransaction | null>(
        null,
    );

    return (
        <>
            <Head title="Recorrências" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Recorrências"
                    description="Templates de transações que se repetem automaticamente"
                />

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 font-medium">
                                    Descrição
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Categoria
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Periodicidade
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Próxima execução
                                </th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Valor
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Status
                                </th>
                                <th className="w-24 px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {recurringTransactions.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Nenhuma recorrência cadastrada.
                                        Marque uma transação como recorrente
                                        para criar uma.
                                    </td>
                                </tr>
                            )}
                            {recurringTransactions.map((recurring) => (
                                <tr
                                    key={recurring.id}
                                    className="border-t"
                                >
                                    <td className="px-4 py-2">
                                        {recurring.description ?? '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {recurring.category?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {frequencyLabels[recurring.frequency]}
                                    </td>
                                    <td className="px-4 py-2">
                                        {formatDate(recurring.next_run_date)}
                                    </td>
                                    <td
                                        className={`px-4 py-2 text-right font-medium ${
                                            recurring.type === 'income'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-destructive'
                                        }`}
                                    >
                                        {recurring.type === 'income'
                                            ? '+'
                                            : '-'}
                                        {formatCurrency(recurring.amount)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <Badge
                                            variant={
                                                recurring.active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {recurring.active
                                                ? 'Ativa'
                                                : 'Pausada'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-1">
                                            {recurring.active && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    title="Lançar agora"
                                                    onClick={() =>
                                                        setLaunching(recurring)
                                                    }
                                                >
                                                    <Send className="size-4 text-primary" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setEditing(recurring)
                                                }
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Form
                                                {...RecurringTransactionController.destroy.form(
                                                    recurring.id,
                                                )}
                                                onBefore={() =>
                                                    confirm(
                                                        'Excluir esta recorrência? As transações já geradas não serão apagadas.',
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
            </div>

            <Dialog
                open={editing !== null}
                onOpenChange={(value) => !value && setEditing(null)}
            >
                <DialogContent key={editing?.id}>
                    <DialogHeader>
                        <DialogTitle>Editar recorrência</DialogTitle>
                    </DialogHeader>

                    {editing && (
                        <Form
                            {...RecurringTransactionController.update.form(
                                editing.id,
                            )}
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
                            onSuccess={() => setEditing(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="amount">Valor</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            name="amount"
                                            required
                                            defaultValue={editing.amount}
                                        />
                                        <InputError message={errors.amount} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="category_id">
                                                Categoria
                                            </Label>
                                            <Select
                                                name="category_id"
                                                defaultValue={
                                                    editing.category
                                                        ? String(
                                                              editing.category
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
                                                message={errors.category_id}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="payment_method_id">
                                                Forma de pagamento
                                            </Label>
                                            <Select
                                                name="payment_method_id"
                                                defaultValue={
                                                    editing.payment_method
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
                                                        (paymentMethod) => (
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

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="frequency">
                                                Periodicidade
                                            </Label>
                                            <Select
                                                name="frequency"
                                                defaultValue={
                                                    editing.frequency
                                                }
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
                                                message={errors.frequency}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="end_date">
                                                Repetir até (opcional)
                                            </Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                name="end_date"
                                                defaultValue={
                                                    editing.end_date ??
                                                    undefined
                                                }
                                            />
                                            <InputError
                                                message={errors.end_date}
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
                                                editing.description ??
                                                undefined
                                            }
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="hidden"
                                            name="active"
                                            value="0"
                                        />
                                        <Checkbox
                                            id="active"
                                            name="active"
                                            value="1"
                                            defaultChecked={editing.active}
                                        />
                                        <Label htmlFor="active">Ativa</Label>
                                    </div>

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
                    )}
                </DialogContent>
            </Dialog>

            {/* Launch dialog: confirm/adjust an occurrence before creating it */}
            <Dialog
                open={launching !== null}
                onOpenChange={(value) => !value && setLaunching(null)}
            >
                <DialogContent key={`launch-${launching?.id}`}>
                    <DialogHeader>
                        <DialogTitle>Lançar agora</DialogTitle>
                    </DialogHeader>

                    {launching && (
                        <Form
                            {...RecurringTransactionController.launch.form(
                                launching.id,
                            )}
                            options={{ preserveScroll: true }}
                            transform={(data) => ({
                                ...data,
                                payment_method_id:
                                    data.payment_method_id === 'none'
                                        ? null
                                        : data.payment_method_id,
                            })}
                            onSuccess={() => setLaunching(null)}
                            className="space-y-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Ajuste os dados desta ocorrência antes
                                        de confirmar o lançamento.
                                    </p>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="launch-amount">
                                                Valor
                                            </Label>
                                            <Input
                                                id="launch-amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                name="amount"
                                                required
                                                defaultValue={launching.amount}
                                            />
                                            <InputError
                                                message={errors.amount}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="launch-transaction-date">
                                                Data do pagamento
                                            </Label>
                                            <Input
                                                id="launch-transaction-date"
                                                type="date"
                                                name="transaction_date"
                                                required
                                                defaultValue={
                                                    launching.next_run_date
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.transaction_date
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="launch-due-date">
                                                Vencimento (opcional)
                                            </Label>
                                            <Input
                                                id="launch-due-date"
                                                type="date"
                                                name="due_date"
                                            />
                                            <InputError
                                                message={errors.due_date}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="launch-payment-method">
                                                Forma de pagamento
                                            </Label>
                                            <Select
                                                name="payment_method_id"
                                                defaultValue={
                                                    launching.payment_method
                                                        ? String(
                                                              launching
                                                                  .payment_method
                                                                  .id,
                                                          )
                                                        : 'none'
                                                }
                                            >
                                                <SelectTrigger
                                                    id="launch-payment-method"
                                                    className="w-full"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">
                                                        Nenhuma
                                                    </SelectItem>
                                                    {paymentMethods.map(
                                                        (pm) => (
                                                            <SelectItem
                                                                key={pm.id}
                                                                value={String(
                                                                    pm.id,
                                                                )}
                                                            >
                                                                {pm.name}
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
                                        <Label htmlFor="launch-description">
                                            Observação
                                        </Label>
                                        <Input
                                            id="launch-description"
                                            name="description"
                                            defaultValue={
                                                launching.description ??
                                                undefined
                                            }
                                        />
                                        <InputError
                                            message={errors.description}
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Confirmar lançamento
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

RecurringTransactionsIndex.layout = {
    breadcrumbs: [
        { title: 'Recorrências', href: recurringTransactionsIndex() },
    ] satisfies BreadcrumbItem[],
};
