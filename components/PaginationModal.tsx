"use client"

import { PaginationProps } from "@/types/type"

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 mt-8">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
      >
        Prev
      </button>

      <div className="hidden sm:flex gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
              currentPage === page
                ? "bg-blue-600 text-white"
                : "border border-gray-300 text-gray-900 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <span className="sm:hidden text-sm text-gray-600 font-medium">
        {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
      >
        Next
      </button>
    </div>
  )
}