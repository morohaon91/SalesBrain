import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs" style={{ color: "hsl(228, 12%, 47%)" }}>
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-1.5"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Previous</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-1.5"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        >
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
