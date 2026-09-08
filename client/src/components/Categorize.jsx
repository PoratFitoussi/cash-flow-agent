import React, { useState } from 'react';
import { Settings } from 'lucide-react';

const Categorize = () => {
  const [swipeDirection, setSwipeDirection] = useState('');
  const [cards, setCards] = useState([
    { id: 1, name: 'McDonalds', amount: '₪120', date: 'Today, 14:30' },
    { id: 2, name: 'Paz Gas Station', amount: '₪350', date: 'Yesterday' }
  ]);

  const handleCategorize = (category) => {
    // Simulate swipe out
    setSwipeDirection('swipe-out');
    
    setTimeout(() => {
      setCards(prev => prev.slice(1));
      setSwipeDirection('');
    }, 300);
  };

  const activeCard = cards[0];

  return (
    <div className="categorize-container">
      <header className="categorize-header">
        <h1 className="title text-gradient">Vault</h1>
        <button className="icon-btn">
          <Settings size={20} />
        </button>
      </header>

      <div className="card-area">
        {activeCard ? (
          <div className={`tinder-card glass-panel ${swipeDirection}`}>
            <div className="card-glow"></div>
            <div className="card-content">
              <span className="card-merchant">{activeCard.name}</span>
              <span className="card-amount">{activeCard.amount}</span>
            </div>
            <span className="card-date">{activeCard.date}</span>
          </div>
        ) : (
          <div className="all-caught-up">
            <span className="emoji-large">🎉</span>
            <h2>All caught up!</h2>
            <p>You have categorized all your transactions.</p>
          </div>
        )}
      </div>

      <div className="action-area">
        <p className="swipe-hint">Tap to categorize</p>
        <div className="category-buttons">
          <button className="category-btn" onClick={() => handleCategorize('food')}>
            <div className="btn-circle bg-food">🍔</div>
            <span className="btn-label">Food</span>
          </button>
          
          <button className="category-btn" onClick={() => handleCategorize('gas')}>
            <div className="btn-circle bg-gas">⛽</div>
            <span className="btn-label">Gas</span>
          </button>
          
          <button className="category-btn" onClick={() => handleCategorize('groceries')}>
            <div className="btn-circle bg-groceries">🛒</div>
            <span className="btn-label">Groceries</span>
          </button>
          
          <button className="category-btn" onClick={() => handleCategorize('baby')}>
            <div className="btn-circle bg-baby">🍼</div>
            <span className="btn-label">Baby</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Categorize;
