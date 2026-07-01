import { Form, Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import PaymentMethodController from '@/actions/App/Http/Controllers/Finance/PaymentMethodController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
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
import { index as paymentMethodsIndex } from '@/routes/payment-methods';
import type { BreadcrumbItem, PaymentMethod } from '@/types';

export default function PaymentMethodsIndex({
    paymentMethods,
}: {
    paymentMethods: PaymentMethod[];
}) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<PaymentMethod | null>(null);

    const openCreate = () => {
        setEditing(null);
        setOpen(true);
    };

    const openEdit = (paymentMethod: PaymentMethod) => {
        setEditing(paymentMethod);
        setOpen(true);
    };

    return (
        <>
            <Head title="Formas de pagamento" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Formas de pagamento"
                        description="Gerencie os métodos usados em suas transações"
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>
                                <Plus />
                                Nova forma de pagamento
                            </Button>
                        </DialogTrigger>
                        <DialogContent key={editing?.id ?? 'new'}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editing
                                        ? 'Editar forma de pagamento'
                                        : 'Nova forma de pagamento'}
                                </DialogTitle>
                            </DialogHeader>

                            <Form
                                {...(editing
                                    ? PaymentMethodController.update.form(
                                          editing.id,
                                      )
                                    : PaymentMethodController.store.form())}
                                options={{ preserveScroll: true }}
                                onSuccess={() => setOpen(false)}
                                className="space-y-4"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nome</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                required
                                                defaultValue={editing?.name}
                                            />
                                            <InputError
                                                message={errors.name}
                                            />
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
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-2 font-medium">
                                    Nome
                                </th>
                                <th className="w-24 px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {paymentMethods.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Nenhuma forma de pagamento cadastrada.
                                    </td>
                                </tr>
                            )}
                            {paymentMethods.map((paymentMethod) => (
                                <tr
                                    key={paymentMethod.id}
                                    className="border-t"
                                >
                                    <td className="px-4 py-2">
                                        {paymentMethod.name}
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEdit(paymentMethod)
                                                }
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Form
                                                {...PaymentMethodController.destroy.form(
                                                    paymentMethod.id,
                                                )}
                                                onBefore={() =>
                                                    confirm(
                                                        `Excluir a forma de pagamento "${paymentMethod.name}"?`,
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
        </>
    );
}

PaymentMethodsIndex.layout = {
    breadcrumbs: [
        { title: 'Formas de pagamento', href: paymentMethodsIndex() },
    ] satisfies BreadcrumbItem[],
};
