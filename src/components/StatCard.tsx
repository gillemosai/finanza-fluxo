import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  const trendDescription = trend 
    ? `${trend.isPositive ? "Aumento" : "Redução"} de ${trend.value} em relação ao mês anterior`
    : "";

  return (
    <Card 
      className={`shadow-card border-0 bg-card/80 backdrop-blur-sm hover:shadow-glow transition-all duration-300 ${className}`}
      role="region"
      aria-label={`${title}: ${value}${trend ? `. ${trendDescription}` : ""}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3 p-3 sm:p-6">
        <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div 
          className="p-1.5 sm:p-2 rounded-lg bg-gradient-primary/10 flex-shrink-0"
          aria-hidden="true"
        >
          {icon}
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <div 
          className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-1 break-words"
          aria-live="polite"
        >
          {value}
        </div>
        {trend && (
          <p 
            className={`text-xs flex items-center ${
              trend.isPositive ? "text-success" : "text-destructive"
            }`}
            aria-label={trendDescription}
          >
            <span className="mr-1" aria-hidden="true">
              {trend.isPositive ? "↗" : "↘"}
            </span>
            <span className="text-xs hidden sm:inline">
              {trend.value} em relação ao mês anterior
            </span>
            <span className="text-xs sm:hidden">
              {trend.value}
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}