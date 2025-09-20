import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MonthFilterProps {
  onFilterChange: (month: string | null) => void;
  selectedMonth: string | null;
}

export function MonthFilter({ onFilterChange, selectedMonth }: MonthFilterProps) {
  const [months] = useState(() => {
    const currentDate = new Date();
    const monthsArray = [];
    
    // Gerar os últimos 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      
      // Create format that matches database: "SET/25" 
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
      const year = date.getFullYear().toString().slice(-2);
      const monthRef = `${monthName}/${year}`;
      
      
      
      monthsArray.push({
        value: monthRef,
        label: date.toLocaleDateString('pt-BR', { 
          month: 'long', 
          year: 'numeric' 
        })
      });
    }
    
    return monthsArray;
  });

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedMonth || ""} onValueChange={(value) => onFilterChange(value || null)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por mês" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedMonth && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onFilterChange(null)}
          className="h-10 px-3"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}