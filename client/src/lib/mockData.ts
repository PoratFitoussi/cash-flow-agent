export type MoneyFlowType = "income" | "expense";

export type MoneyItem = {
  id: string;
  month: string;
  type: MoneyFlowType;
  category: string;
  name: string;
  expectedAmount: number;
  actualAmount: number;
};

// Generate some mock data for current and previous month
const currentDate = new Date();
const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

const prevDate = new Date();
prevDate.setMonth(prevDate.getMonth() - 1);
const previousMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

export const mockMoneyItems: MoneyItem[] = [
  // Current Month
  {
    id: "1",
    month: currentMonth,
    type: "income",
    category: "salary",
    name: "משכורת",
    expectedAmount: 15000,
    actualAmount: 15000,
  },
  {
    id: "2",
    month: currentMonth,
    type: "expense",
    category: "housing",
    name: "שכירות",
    expectedAmount: 4500,
    actualAmount: 4500,
  },
  {
    id: "3",
    month: currentMonth,
    type: "expense",
    category: "food",
    name: "סופר",
    expectedAmount: 2500,
    actualAmount: 1200, // Still spending
  },
  {
    id: "4",
    month: currentMonth,
    type: "expense",
    category: "transport",
    name: "תחבורה",
    expectedAmount: 800,
    actualAmount: 450,
  },
  {
    id: "5",
    month: currentMonth,
    type: "expense",
    category: "bills",
    name: "חשבונות",
    expectedAmount: 1000,
    actualAmount: 1050,
  },
  
  // Previous Month
  {
    id: "6",
    month: previousMonth,
    type: "income",
    category: "salary",
    name: "משכורת",
    expectedAmount: 15000,
    actualAmount: 15000,
  },
  {
    id: "7",
    month: previousMonth,
    type: "expense",
    category: "housing",
    name: "שכירות",
    expectedAmount: 4500,
    actualAmount: 4500,
  },
  {
    id: "8",
    month: previousMonth,
    type: "expense",
    category: "food",
    name: "סופר",
    expectedAmount: 2500,
    actualAmount: 2800, // Overspent
  },
  {
    id: "9",
    month: previousMonth,
    type: "expense",
    category: "transport",
    name: "תחבורה",
    expectedAmount: 800,
    actualAmount: 750,
  },
  {
    id: "10",
    month: previousMonth,
    type: "expense",
    category: "bills",
    name: "חשבונות",
    expectedAmount: 1000,
    actualAmount: 950,
  }
];

export const getMockBalance = () => {
  return 8450.50;
};
