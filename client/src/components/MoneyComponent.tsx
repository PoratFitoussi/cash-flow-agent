import { useState } from "react";
import { MoneyItem } from "@/lib/mockData";
import { MoreVertical, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MoneyComponent({ item, onUpdate }: { item: MoneyItem, onUpdate?: (item: MoneyItem) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editAmount, setEditAmount] = useState(item.actualAmount.toString());

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...item,
        name: editName,
        actualAmount: Number(editAmount) || item.actualAmount
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(item.name);
    setEditAmount(item.actualAmount.toString());
    setIsEditing(false);
  };

  const isIncome = item.type === "income";

  if (isEditing) {
    return (
      <Card className="mb-3 border-primary/20 bg-card shadow-sm">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">שם / קטגוריה</label>
              <Input 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)} 
                className="h-8 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">סכום בפועל (₪)</label>
              <Input 
                type="number"
                value={editAmount} 
                onChange={(e) => setEditAmount(e.target.value)} 
                className="h-8 text-sm text-left ltr"
                dir="ltr"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-1">
            <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
              <X className="h-4 w-4 ml-1" /> ביטול
            </Button>
            <Button size="sm" onClick={handleSave} className="h-8">
              <Check className="h-4 w-4 ml-1" /> שמור
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow bg-card relative overflow-hidden group">
      {/* Visual indicator for income vs expense */}
      <div className={`absolute right-0 top-0 bottom-0 w-1 ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      
      <CardContent className="p-4 flex items-center justify-between pr-5">
        <div className="flex flex-col">
          <span className="font-medium text-base text-foreground">{item.name}</span>
          <span className="text-xs text-muted-foreground mt-0.5 opacity-80">{item.category}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1.5">
              <span className={`text-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground font-semibold'}`}>
                {isIncome ? '+' : '-'}₪{item.actualAmount.toLocaleString()}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              תכנון: ₪{item.expectedAmount.toLocaleString()}
            </span>
          </div>

          {/* Action Menu (Top Left logic in RTL means it naturally goes to the left side) */}
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">פעולות</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                ערוך פריט
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
