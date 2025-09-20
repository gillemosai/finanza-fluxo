import { TableHead } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface TableHeaderProps {
  children: React.ReactNode;
  sortKey?: string;
  currentSort?: {
    field: string;
    direction: 'asc' | 'desc';
  } | null;
  onSort?: (field: string) => void;
}

export function TableHeader({ children, sortKey, currentSort, onSort }: TableHeaderProps) {
  if (!sortKey || !onSort) {
    return <TableHead>{children}</TableHead>;
  }

  const getSortIcon = () => {
    if (!currentSort || currentSort.field !== sortKey) {
      return <ChevronsUpDown className="w-4 h-4" />;
    }
    return currentSort.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4" />
      : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <TableHead>
      <Button
        variant="ghost"
        onClick={() => onSort(sortKey)}
        className="h-auto p-0 font-medium hover:bg-transparent flex items-center gap-2"
      >
        {children}
        {getSortIcon()}
      </Button>
    </TableHead>
  );
}