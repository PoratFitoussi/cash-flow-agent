import React from 'react';
import ExpensesItem, { Expense } from './ExpensesItem';

interface ExpensesListProps {
  expenses?: Expense[];
}

const MOCK_DATA: Expense[] = [
  {
    expense_id: 'm1',
    merchant: 'McDonalds',
    price: 45.50,
    currency: 'ILS',
    date: new Date().toISOString(),
    user_that_purchase: 'You',
    category: 'Food',
  },
  {
    expense_id: 'm2',
    merchant: 'Paz Gas Station',
    price: 250.00,
    currency: 'ILS',
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    user_that_purchase: 'You',
    category: 'Transportation',
  },
  {
    expense_id: 'm3',
    merchant: 'Amazon',
    price: 120.99,
    currency: 'USD',
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    user_that_purchase: 'You',
    category: 'Shopping',
  }
];

const ExpensesList: React.FC<ExpensesListProps> = ({ expenses }) => {
  // Use mock data if the expenses array is missing or empty
  const displayExpenses = (!expenses || expenses.length === 0) ? MOCK_DATA : expenses;

  return (
    <div className="flex flex-col w-full">
      {displayExpenses.map((expense) => (
        <ExpensesItem key={expense.expense_id} expense={expense} />
      ))}
    </div>
  );
};

export default ExpensesList;
