import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ExpensesList from './Expenses/components/ExpensesList';

function App() {
  return (
    <div className="w-full min-h-screen text-text-primary flex flex-col p-6">
      <Routes>
        <Route path="/" element={
          <div className="flex flex-col w-full h-full max-w-lg mx-auto">
            <header className="mb-6">
              <h1 className="text-2xl font-bold text-text-primary">Recent Expenses</h1>
            </header>
            <ExpensesList />
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
