
import React from "react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

export default function PaginationControls({ 
  currentPage, 
  totalPages, 
  setCurrentPage 
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;
  
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            aria-disabled={currentPage === 1}
          />
        </PaginationItem>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(page => {
            return (
              page === 1 || 
              page === totalPages || 
              (page >= currentPage - 1 && page <= currentPage + 1)
            );
          })
          .map((page, index, array) => {
            const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
            const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
            
            return (
              <React.Fragment key={page}>
                {showEllipsisBefore && (
                  <PaginationItem>
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={page === currentPage}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
                
                {showEllipsisAfter && (
                  <PaginationItem>
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  </PaginationItem>
                )}
              </React.Fragment>
            );
          })}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            aria-disabled={currentPage === totalPages}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
