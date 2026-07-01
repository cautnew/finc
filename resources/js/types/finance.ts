export type TransactionType = 'income' | 'expense';

export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type Category = {
    id: number;
    name: string;
    color: string | null;
};

export type PaymentMethod = {
    id: number;
    name: string;
};

export type Transaction = {
    id: number;
    type: TransactionType;
    amount: string;
    transaction_date: string;
    due_date: string | null;
    description: string | null;
    is_recurring: boolean;
    category: Category | null;
    payment_method: PaymentMethod | null;
};

export type RecurringTransaction = {
    id: number;
    type: TransactionType;
    amount: string;
    description: string | null;
    frequency: RecurrenceFrequency;
    start_date: string;
    next_run_date: string;
    end_date: string | null;
    active: boolean;
    category: Category | null;
    payment_method: PaymentMethod | null;
};

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};
