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
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2>Budgets</h2>
            <p>Coming soon...</p>
          </div>
        )}
        {activeTab === 'goals' && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2>Goals</h2>
            <p>Coming soon...</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <h2>Settings</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </div>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </>
  );
}

export default App;
