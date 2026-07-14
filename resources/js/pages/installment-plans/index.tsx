import { Form, Head } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InstallmentPlanController from '@/actions/App/Http/Controllers/Finance/InstallmentPlanController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { index as installmentPlansIndex } from '@/routes/installment-plans';
import type {
    BreadcrumbItem,
    Category,
    InstallmentPlan,
    PaymentMethod,
} from '@/types';

const formatCurrency = (value: string) =>
    new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(Number(value));

const formatDate = (value: string) =>
    new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
        new Date(`${value}T00:00:00Z`),
    );

export default function InstallmentPlansIndex({
    installmentPlans,
    categories,
    paymentMethods,
}: {
    installmentPlans: InstallmentPlan[];
    categories: Category[];
    paymentMethods: PaymentMethod[];
}) {
    const [editing, setEditing] = useState<InstallmentPlan | null>(null);
    const [deleting, setDeleting] = useState<InstallmentPlan | null>(null);
    const [previewPaid, setPreviewPaid] = useState(0);
    const [previewTotal, setPreviewTotal] = useState(1);

    const openEdit = (plan: InstallmentPlan) => {
        setEditing(plan);
        setPreviewPaid(plan.installments_paid);
        setPreviewTotal(plan.installments_total);
    };

    const previewPercentageRemaining =
        previewTotal > 0
            ? Math.round(
                  ((previewTotal - previewPaid) / previewTotal) * 100 * 100,
              ) / 100
            : 0;

    return (
        <>
            <Head title="Parcelamentos" />

            <div className="space-y-6 p-4">
                <Heading
                    title="Parcelamentos"
                    description="Compras parceladas, exibidas pelo valor total da compra"
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
                                    Início
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    Parcelas
                                </th>
                                <th className="px-4 py-2 font-medium">
                                    % restante
                                </th>
                                <th className="px-4 py-2 text-right font-medium">
                                    Valor total
                                </th>
                                <th className="w-24 px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {installmentPlans.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Nenhum parcelamento cadastrado. Marque
                                        uma transação como parcelada para
                                        criar um.
                                    </td>
                                </tr>
                            )}
                            {installmentPlans.map((plan) => (
                                <tr key={plan.id} className="border-t">
                                    <td className="px-4 py-2">
                                        {plan.description ?? '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {plan.category?.name ?? '—'}
                                    </td>
                                    <td className="px-4 py-2">
                                        {formatDate(plan.start_date)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <Badge variant="outline">
                                            {plan.installments_paid}/
                                            {plan.installments_total}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-2">
                                        {plan.percentage_remaining}%
                                    </td>
                                    <td
                                        className={`px-4 py-2 text-right font-medium ${
                                            plan.type === 'income'
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-destructive'
                                        }`}
                                    >
                                        {plan.type === 'income' ? '+' : '-'}
                                        {formatCurrency(plan.total_amount)}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEdit(plan)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    setDeleting(plan)
                                                }
                                            >
                                                <Trash2 className="size-4 text-destructive" />
                                            </Button>
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
                        <DialogTitle>Editar parcelamento</DialogTitle>
                    </DialogHeader>

                    {editing && (
                        <Form
                            {...InstallmentPlanController.update.form(
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="total_amount">
                                                Valor total
                                            </Label>
                                            <Input
                                                id="total_amount"
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                name="total_amount"
                                                required
                                                defaultValue={
                                                    editing.total_amount
                                                }
                                            />
                                            <InputError
                                                message={errors.total_amount}
                                            />
                                        </div>

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
                                                defaultValue={
                                                    editing.installments_total
                                                }
                                                onChange={(e) =>
                                                    setPreviewTotal(
                                                        Number(
                                                            e.target.value,
                                                        ) || 0,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    errors.installments_total
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="installments_paid">
                                            Parcelas já pagas
                                        </Label>
                                        <Input
                                            id="installments_paid"
                                            type="number"
                                            step="1"
                                            min="0"
                                            name="installments_paid"
                                            required
                                            defaultValue={
                                                editing.installments_paid
                                            }
                                            onChange={(e) =>
                                                setPreviewPaid(
                                                    Number(e.target.value) ||
                                                        0,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.installments_paid}
                                        />
                                        <p className="text-sm text-muted-foreground">
                                            Falta {previewPercentageRemaining}
                                            % para concluir o pagamento total
                                            deste parcelamento.
                                        </p>
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

                                    <p className="text-sm text-muted-foreground">
                                        Alterar o valor total redistribui o
                                        valor entre as parcelas existentes.
                                        Alterar o número de parcelas apaga as
                                        parcelas atuais e lança novas com os
                                        valores atualizados.
                                    </p>

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

            <Dialog
                open={deleting !== null}
                onOpenChange={(value) => !value && setDeleting(null)}
            >
                <DialogContent key={`delete-${deleting?.id}`}>
                    <DialogHeader>
                        <DialogTitle>Excluir parcelamento</DialogTitle>
                    </DialogHeader>

                    {deleting && (
                        <Form
                            {...InstallmentPlanController.destroy.form(
                                deleting.id,
                            )}
                            options={{ preserveScroll: true }}
                            onSuccess={() => setDeleting(null)}
                            className="space-y-4"
                        >
                            {({ processing }) => (
                                <>
                                    <p className="text-sm text-muted-foreground">
                                        Excluir este parcelamento também
                                        excluirá todas as{' '}
                                        {deleting.installments_total} parcelas
                                        já lançadas na página de Transações.
                                        Esta ação não pode ser desfeita.
                                    </p>

                                    <DialogFooter>
                                        <Button
                                            type="submit"
                                            variant="destructive"
                                            disabled={processing}
                                        >
                                            Excluir
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

InstallmentPlansIndex.layout = {
    breadcrumbs: [
        { title: 'Parcelamentos', href: installmentPlansIndex() },
    ] satisfies BreadcrumbItem[],
};
