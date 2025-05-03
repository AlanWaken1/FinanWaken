export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface FinancialEvent {
  id: string;
  title: string;
  amount: number;
  date: Date | string;
  type: 'income' | 'expense' | 'debt_payment' | 'goal_contribution' | 'debt_due' | 'goal_deadline';
  category?: string;
  description?: string;
  isCompleted?: boolean;
  relatedId?: string; // ID de la deuda, meta, etc. relacionada
  userId: string;
  createdAt: Date | string;
}

export type CalendarView = 'month' | 'week' | 'day';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  userId: string;
  createdAt: string;
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string;
  notes: string | null;
  userId: string;
  createdAt: string;
}

export interface Debt {
  id: string;
  title: string;
  totalAmount: number;
  remaining: number;
  creditor: string;
  startDate: string;
  dueDate: string | null;
  isPaid: boolean;
  userId: string;
  createdAt: string;
  payments: DebtPayment[];
}

export interface DebtPayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  notes: string | null;
  userId: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  saved: number;
  deadline: string | null;
  description: string | null;
  isAchieved: boolean;
  userId: string;
  createdAt: string;
  contributions: GoalContribution[];
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
  notes: string | null;
  userId: string;
  createdAt: string;
} 