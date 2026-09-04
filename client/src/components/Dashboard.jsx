import React from 'react';
import { Bell, User } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="user-info">
          <span className="greeting">Your Name</span>
          <h1 className="title">Dashboard</h1>
        </div>
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <div className="avatar">
          <User size={20} />
        </div>
      </header>

      {/* Main Balance Card */}
      <section className="balance-card glass-panel">
        <div className="card-header">
          <span className="card-title">Total Balance</span>
          <button className="more-btn">...</button>
        </div>
        <h2 className="balance-amount">₪1,226.50</h2>
        
        <div className="spending-section">
          <span className="spending-label">Monthly Spending</span>
          <div className="progress-track">
            <div className="progress-fill fill-accent" style={{ width: '45%' }}></div>
          </div>
          <div className="spending-details">
            <span className="spent-amount">₪1,200</span>
            <span className="remaining-amount">₪237.00</span>
          </div>
        </div>
      </section>

      {/* Budgets Section */}
      <section className="budgets-section">
        <div className="section-header">
          <h3 className="section-title">Monthly Budgets</h3>
          <button className="text-btn">See more</button>
        </div>
        
        <div className="budgets-list glass-panel">
          
          <div className="budget-item">
            <div className="budget-info">
              <span className="budget-name">🍽️ Food & Drink</span>
              <span className="budget-amounts">
                <span className="spent safe-text">₪1,200</span> / ₪1,500
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-safe" style={{ width: '80%' }}></div>
            </div>
          </div>

          <div className="budget-item">
            <div className="budget-info">
              <span className="budget-name">🚗 Transportation</span>
              <span className="budget-amounts">
                <span className="spent warning-text">₪1,200</span> / ₪1,000
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-warning" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="budget-item">
            <div className="budget-info">
              <span className="budget-name">🛍️ Shopping</span>
              <span className="budget-amounts">
                <span className="spent danger-text">₪1,300</span> / ₪1,500
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill fill-danger" style={{ width: '86%' }}></div>
            </div>
          </div>

        </div>
      </section>

      {/* Recent Transactions Section */}
      <section className="transactions-section">
        <div className="section-header">
          <h3 className="section-title">Recent Transactions</h3>
          <button className="text-btn">See all</button>
        </div>
        
        <div className="transactions-list glass-panel">
          
          <div className="transaction-item">
            <div className="transaction-icon icon-income">
              <span className="emoji">💰</span>
            </div>
            <div className="transaction-details">
              <span className="transaction-name">Salary</span>
              <span className="transaction-category safe-dot">Income</span>
            </div>
            <span className="transaction-amount amount-positive">+ ₪12,500</span>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon icon-expense">
              <span className="emoji">🍔</span>
            </div>
            <div className="transaction-details">
              <span className="transaction-name">McDonalds</span>
              <span className="transaction-category expense-dot">Food & Drink</span>
            </div>
            <span className="transaction-amount">- ₪120</span>
          </div>

          <div className="transaction-item">
            <div className="transaction-icon icon-expense">
              <span className="emoji">⛽</span>
            </div>
            <div className="transaction-details">
              <span className="transaction-name">Paz Gas Station</span>
              <span className="transaction-category expense-dot">Transportation</span>
            </div>
            <span className="transaction-amount">- ₪350</span>
          </div>

        </div>
      </section>
      
      {/* Spacer for bottom nav */}
      <div style={{ height: '40px' }}></div>
    </div>
  );
};

export default Dashboard;
