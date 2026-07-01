import { Form, Head } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import CategoryController from '@/actions/App/Http/Controllers/Finance/CategoryController';
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
import { index as categoriesIndex } from '@/routes/categories';
import type { BreadcrumbItem, Category } from '@/types';

export default function CategoriesIndex({
    categories,
}: {
    categories: Category[];
}) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);

    const openCreate = () => {
        setEditing(null);
        setOpen(true);
    };

    const openEdit = (category: Category) => {
        setEditing(category);
        setOpen(true);
    };

    return (
        <>
            <Head title="Categorias" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Categorias"
                        description="Organize suas receitas e despesas por categoria"
                    />

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreate}>
                                <Plus />
                                Nova categoria
                            </Button>
                        </DialogTrigger>
                        <DialogContent key={editing?.id ?? 'new'}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editing
                                        ? 'Editar categoria'
                                        : 'Nova categoria'}
                                </DialogTitle>
                            </DialogHeader>

                            <Form
                                {...(editing
                                    ? CategoryController.update.form(
                                          editing.id,
                                      )
                                    : CategoryController.store.form())}
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

                                        <div className="grid gap-2">
                                            <Label htmlFor="color">Cor</Label>
                                            <Input
                                                id="color"
                                                type="color"
                                                name="color"
                                                className="h-9 w-16 p-1"
                                                defaultValue={
                                                    editing?.color ??
                                                    '#94a3b8'
                                                }
                                            />
                                            <InputError
                                                message={errors.color}
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
                                <th className="w-24 px-4 py-2 font-medium">
                                    Cor
                                </th>
                                <th className="w-24 px-4 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-4 py-6 text-center text-muted-foreground"
                                    >
                                        Nenhuma categoria cadastrada.
                                    </td>
                                </tr>
                            )}
                            {categories.map((category) => (
                                <tr
                                    key={category.id}
                                    className="border-t"
                                >
                                    <td className="px-4 py-2">
                                        {category.name}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span
                                            className="inline-block size-4 rounded-full border"
                                            style={{
                                                backgroundColor:
                                                    category.color ??
                                                    undefined,
                                            }}
                                        />
                                    </td>
                                    <td className="px-4 py-2">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openEdit(category)
                                                }
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Form
                                                {...CategoryController.destroy.form(
                                                    category.id,
                                                )}
                                                onBefore={() =>
                                                    confirm(
                                                        `Excluir a categoria "${category.name}"?`,
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

CategoriesIndex.layout = {
    breadcrumbs: [
        { title: 'Categorias', href: categoriesIndex() },
    ] satisfies BreadcrumbItem[],
};
