import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthName: string;
}

const CATEGORIES = [
  { id: "donation", name: "תרומה", icon: "💌" },
  { id: "tourism", name: "תיירות", icon: "✈️" },
  { id: "pets", name: "חיות מחמד", icon: "🐕" },
  { id: "other", name: "אחר", icon: "📎" },
  { id: "dining", name: "אוכל בחוץ", icon: "🥐" },
  { id: "transport", name: "תחבורה ציבורית", icon: "🚌" },
];

export function AddCategoryModal({ isOpen, onClose, monthName }: AddCategoryModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedCategory, setSelectedCategory] = useState<typeof CATEGORIES[0] | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [selectedRange, setSelectedRange] = useState<string>("current-onwards");

  if (!isOpen) return null;

  const baseRecommended = 5027;
  const currentAmountNum = Number(amount) || 0;
  const newRecommended = Math.max(0, baseRecommended - currentAmountNum);
  const actualSpent = 694;

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as 1 | 2 | 3);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as 1 | 2 | 3);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-4 animate-in fade-in">
      <div className="bg-background w-full max-w-sm rounded-3xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#6571ff] p-5 text-white flex items-center justify-center relative">
          <button 
            onClick={step === 1 ? onClose : handleBack}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            {step === 1 ? <X className="h-6 w-6" /> : <ChevronRight className="h-6 w-6" />}
          </button>
          <h2 className="text-xl font-bold">הוספת קטגוריה למעקב</h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#f9fafb]">
          {step === 1 && (
            <div className="flex flex-col gap-3">
              {CATEGORIES.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setStep(2);
                  }}
                  className="bg-white border rounded-2xl p-4 flex items-center justify-between hover:border-[#6571ff]/50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-foreground">{cat.name}</span>
                    <span className="text-2xl bg-muted/30 p-2 rounded-full">{cat.icon}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && selectedCategory && (
            <div className="flex flex-col animate-in slide-in-from-left-4">
              <p className="text-center font-medium text-lg mb-6">
                כמה כסף צפוי לצאת על <strong>הוצאות {selectedCategory.name}</strong> בחודש {monthName}?
              </p>

              <div className="relative mb-8">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6571ff] font-bold text-2xl">
                  ₪
                </div>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white border-2 border-blue-200 rounded-2xl p-4 pl-12 text-4xl text-left font-bold focus:outline-none focus:border-[#6571ff] transition-colors dir-ltr"
                  dir="ltr"
                />
              </div>

              <div className="bg-white rounded-2xl border p-5 shadow-sm mb-6">
                <h3 className="font-bold text-center mb-6">איך זה משפיע על המשתנות?</h3>
                
                <div className="flex justify-between items-end mb-3">
                  <div className="flex flex-col text-right">
                    <span className="text-xs text-muted-foreground mb-1">יצא עד עכשיו</span>
                    <span className="text-lg font-bold text-amber-400 dir-ltr inline-block" dir="ltr">
                      {actualSpent.toLocaleString()} ₪
                    </span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs text-muted-foreground mb-1 text-right">מומלץ להוציא עד</span>
                    <span className="text-lg font-medium text-foreground dir-ltr inline-block" dir="ltr">
                      {newRecommended.toLocaleString()} ₪
                    </span>
                  </div>
                </div>

                <div className="h-3 w-full bg-[#fef3c7] rounded-full overflow-hidden flex justify-end">
                  <div className="h-full bg-amber-400 w-[15%]" />
                  <div className="h-full bg-[#1e1b4b] w-[20%]" />
                </div>
              </div>

              <Button 
                onClick={handleNext}
                className={`w-full py-6 rounded-2xl text-lg font-bold transition-colors ${
                  currentAmountNum > 0 ? 'bg-[#6571ff] hover:bg-[#535dec]' : 'bg-[#a5afff] hover:bg-[#a5afff]'
                }`}
              >
                המשך
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col animate-in slide-in-from-left-4">
              <p className="text-center font-medium text-lg mb-6">
                באיזה חודשים לפתוח את הקטגוריה?
              </p>

              <div className="flex flex-col gap-3 mb-8">
                <label className={`flex flex-row-reverse items-center justify-between p-4 bg-white border-2 rounded-2xl cursor-pointer transition-colors ${selectedRange === 'current-onwards' ? 'border-[#6571ff]' : 'border-border'}`}>
                  <div className="flex items-center">
                    <span className="font-medium text-lg text-foreground ml-3">מהחודש הנוכחי והלאה</span>
                  </div>
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selectedRange === 'current-onwards' ? 'border-[#6571ff]' : 'border-muted-foreground'}`}>
                    {selectedRange === 'current-onwards' && <div className="h-3.5 w-3.5 bg-[#6571ff] rounded-full" />}
                  </div>
                  <input type="radio" className="hidden" checked={selectedRange === 'current-onwards'} onChange={() => setSelectedRange('current-onwards')} />
                </label>
                
                <label className={`flex flex-row-reverse items-center justify-between p-4 bg-white border-2 rounded-2xl cursor-pointer transition-colors ${selectedRange === 'all' ? 'border-[#6571ff]' : 'border-border'}`}>
                  <div className="flex items-center">
                    <span className="font-medium text-lg text-foreground ml-3">בכל החודשים - בעבר, בנוכחי והלאה</span>
                  </div>
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selectedRange === 'all' ? 'border-[#6571ff]' : 'border-muted-foreground'}`}>
                    {selectedRange === 'all' && <div className="h-3.5 w-3.5 bg-[#6571ff] rounded-full" />}
                  </div>
                  <input type="radio" className="hidden" checked={selectedRange === 'all'} onChange={() => setSelectedRange('all')} />
                </label>
                
                <label className={`flex flex-row-reverse items-center justify-between p-4 bg-white border-2 rounded-2xl cursor-pointer transition-colors ${selectedRange === 'current-only' ? 'border-[#6571ff]' : 'border-border'}`}>
                  <div className="flex items-center">
                    <span className="font-medium text-lg text-foreground ml-3">רק בחודש הנוכחי</span>
                  </div>
                  <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center ${selectedRange === 'current-only' ? 'border-[#6571ff]' : 'border-muted-foreground'}`}>
                    {selectedRange === 'current-only' && <div className="h-3.5 w-3.5 bg-[#6571ff] rounded-full" />}
                  </div>
                  <input type="radio" className="hidden" checked={selectedRange === 'current-only'} onChange={() => setSelectedRange('current-only')} />
                </label>
              </div>

              <Button 
                onClick={() => {
                  // Final submission logic
                  onClose();
                  // Reset state for next time
                  setTimeout(() => {
                    setStep(1);
                    setAmount("");
                    setSelectedCategory(null);
                    setSelectedRange("current-onwards");
                  }, 300);
                }}
                className="w-full bg-[#6571ff] hover:bg-[#535dec] py-6 rounded-2xl text-lg font-bold"
              >
                הוספת קטגוריה
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
