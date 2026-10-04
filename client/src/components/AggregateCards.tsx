import { useState } from "react";
import { MoneyItem } from "@/lib/mockData";
import { MoreVertical, ChevronUp, ChevronDown, BarChart2, Edit3 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AggregateCardsProps {
  title: string;
  items: MoneyItem[];
  onUpdateItem: (item: MoneyItem) => void;
  actualLabel?: string;
  expectedLabel?: string;
  colorTheme?: "emerald" | "rose" | "pink" | "orange";
  singleAccordionLabel?: string; // if provided, groups all items under one accordion
}

export function AggregateCards({ 
  title, 
  items, 
  onUpdateItem, 
  actualLabel = "נכנס",
  expectedLabel = "צפוי להיכנס",
  colorTheme = "emerald",
  singleAccordionLabel
}: AggregateCardsProps) {
  
  const totalExpected = items.reduce((sum, item) => sum + item.expectedAmount, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actualAmount, 0);

  // Progress bar calculation
  let progressPercentage = 0;
  if (totalExpected > 0) {
    progressPercentage = Math.min((totalActual / totalExpected) * 100, 100);
  }

  const [isOpen, setIsOpen] = useState(true);
  const [isFixedOpen, setIsFixedOpen] = useState(true);
  const [isVarOpen, setIsVarOpen] = useState(true);

  // Theme mapping
  const colorMap = {
    emerald: { text: "text-emerald-500", bg: "bg-emerald-500", track: "bg-emerald-100" },
    rose: { text: "text-rose-500", bg: "bg-rose-500", track: "bg-rose-100" },
    pink: { text: "text-[#e83e8c]", bg: "bg-[#e83e8c]", track: "bg-[#fbe8f1]" }, // Using a more magenta-pink as in image
    orange: { text: "text-orange-400", bg: "bg-orange-400", track: "bg-orange-100" }
  };
  
  const theme = colorMap[colorTheme];

  const renderSection = (title: string, sectionItems: MoneyItem[], openState: boolean, toggleState: () => void) => {
    if (sectionItems.length === 0) return null;
    return (
      <div className="flex flex-col border-t">
        <button 
          onClick={toggleState}
          className="flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/20 transition-colors w-full"
        >
          {openState ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          <span className="font-bold text-sm">{title}</span>
        </button>
        
        {openState && (
          <div className="flex flex-col">
            <div className="grid grid-cols-3 gap-2 px-4 py-2 border-b bg-card text-xs font-bold text-foreground text-center">
              <div className="text-left">{expectedLabel}</div>
              <div>{actualLabel}</div>
              <div className="text-right"></div>
            </div>
            {sectionItems.map(item => (
              <ItemRow key={item.id} item={item} themeTextClass={theme.text} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card border rounded-3xl shadow-sm overflow-hidden mb-6 flex flex-col">
      {/* Top Header Section */}
      <div className="p-6 pb-5 relative">
        <div className="absolute top-4 left-4">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-muted/50 rounded-full">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 p-2 rounded-2xl">
              <DropdownMenuItem className="flex items-center justify-between py-3 cursor-pointer">
                <span className="font-medium">חודשים קודמים</span>
                <BarChart2 className="h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center justify-between py-3 cursor-pointer">
                <span className="font-medium">לעדכן צפי</span>
                <Edit3 className="h-4 w-4" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h2 className="text-3xl font-bold text-foreground text-right mt-1 mb-6">{title}</h2>

        <div className="flex justify-between items-end mb-3">
          <div className="flex flex-col text-right">
            <span className="text-sm text-muted-foreground mb-1">{actualLabel}</span>
            <span className={`text-2xl font-bold dir-ltr inline-block ${theme.text}`} dir="ltr">
              {totalActual.toLocaleString()} ₪
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm text-muted-foreground mb-1 text-right">{expectedLabel}</span>
            <span className="text-xl font-medium text-foreground dir-ltr inline-block" dir="ltr">
              {totalExpected.toLocaleString()} ₪
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`h-3 w-full rounded-full overflow-hidden ${theme.track}`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${theme.bg}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {singleAccordionLabel ? (
        renderSection(singleAccordionLabel, items, isOpen, () => setIsOpen(!isOpen))
      ) : (
        <>
          {renderSection(`פירוט ${title} קבועות`, items.filter(i => i.expectedAmount >= 1000), isFixedOpen, () => setIsFixedOpen(!isFixedOpen))}
          {renderSection(`פירוט ${title} משתנות`, items.filter(i => i.expectedAmount < 1000), isVarOpen, () => setIsVarOpen(!isVarOpen))}
        </>
      )}
    </div>
  );
}

function ItemRow({ item, themeTextClass }: { item: MoneyItem, themeTextClass: string }) {
  return (
    <div className="grid grid-cols-3 gap-2 px-4 py-4 border-b last:border-0 items-center hover:bg-muted/5 transition-colors">
      <div className="flex items-center gap-2 text-left justify-start text-sm text-foreground">
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
        <span dir="ltr">{item.expectedAmount.toLocaleString()} ₪</span>
      </div>
      <div className={`text-center text-sm font-bold dir-ltr inline-block ${themeTextClass}`} dir="ltr">
        {item.actualAmount.toLocaleString()} ₪
      </div>
      <div className="text-right text-sm text-foreground">
        {item.name}
      </div>
    </div>
  );
}
