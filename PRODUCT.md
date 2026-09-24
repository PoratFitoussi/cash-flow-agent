# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
React (Vite), TypeScript, Tailwind CSS, Express backend, SQLite (Drizzle).

## Users
Porat and Liza, a couple managing their shared household finances, allowances, and tracking cash flow together on desktop and mobile web.

## Product Purpose
A smart, zero-friction financial dashboard that automatically categorizes transactions using AI, tracks cash flow runway, and separates fixed expenses from variable daily spending so they always know their true available budget.

## Positioning
An AI-first personal finance tracker that learns from past categorization, automatically assigns transaction owners, and predicts future cash flow installments.

## Operating Context
Used daily or weekly to quickly verify unhandled credit card charges, approve AI categorizations, and check budget pacing. 

## Capabilities and Constraints
- Full transaction CRUD and smart filtering (Owner, Recurring, Status, Category, Flow).
- 5 Core Categories: Groceries, Vehicle, Housing, Dining Out, Healthcare.
- Strict constraint: The UI must clearly differentiate between Income and Outflow.
- AI categorization service integrated into the backend.

## Brand Commitments
- Tone: Clean, premium, modern, and highly legible. 
- Fast and responsive, zero lag on mobile.
- Visual Identity: Standard Dashboard Canon (clean, premium cards, standard finance app layout). Executed at full fidelity.

## Evidence on Hand
- Working dashboard UI in `client/src/routes/index.tsx`.
- Backend endpoints for transactions and categories.

## Product Principles
1. **Clarity over Density**: Financial data is stressful; the UI should reduce cognitive load.
2. **AI-Assisted, Human-Confirmed**: The system does the heavy lifting, but the user has the final say (e.g. Manual vs Auto handling).
3. **Action-Oriented**: Focus heavily on what needs attention (e.g. Uncategorized, pending approval) rather than just displaying static history.
