"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";

interface CalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[];
  onSelect?: (date: Date | undefined) => void;
  locale?: any;
  className?: string;
  disabled?: (date: Date) => boolean;
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  locale,
  disabled,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1));
  };
  
  const isSelected = (date: Date) => {
    if (!selected) return false;
    if (mode === "single" && selected instanceof Date) {
      return date.toDateString() === selected.toDateString();
    }
    return false;
  };
  
  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };
  
  const days = [];
  
  // Días vacíos del mes anterior
  for (let i = 0; i < firstDay; i++) {
    days.push(<div key={`empty-${i}`} className="p-2"></div>);
  }
  
  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isDateSelected = isSelected(date);
    const isDateToday = isToday(date);
    const isDisabled = disabled && disabled(date);
    
    days.push(
      <Button
        key={day}
        variant={isDateSelected ? "default" : "ghost"}
        size="sm"
        onClick={() => !isDisabled && onSelect && onSelect(date)}
        disabled={isDisabled}
        className={cn(
          "w-8 h-8 p-0 font-normal",
          isDateToday && !isDateSelected && "bg-accent text-accent-foreground",
          isDateSelected && "bg-primary text-primary-foreground",
        )}
      >
        {day}
      </Button>
    );
  }
  
  return (
    <div className={cn("p-3", className)} {...props}>
      {/* Header with navigation */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="font-medium">
          {monthNames[currentMonth]} {currentYear}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((dayName) => (
          <div
            key={dayName}
            className="p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {dayName}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
    </div>
  );
}

export { Calendar };
