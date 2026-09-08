import React, { useState } from 'react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Categorize from './components/Categorize';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <>
      <div className="scrollable-content">
        {activeTab === 'home' && <Dashboard />}
        {activeTab === 'categorize' && <Categorize />}
        {activeTab === 'budgets' && (
          <div className="p-6 text-center text-text-secondary">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Budgets</h2>
            <p>Coming soon...</p>
          </div>
        )}
        {activeTab === 'goals' && (
          <div className="p-6 text-center text-text-secondary">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Goals</h2>
            <p>Coming soon...</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="p-6 text-center text-text-secondary">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Settings</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}

export default App;
