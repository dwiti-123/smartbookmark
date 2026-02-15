export interface Bookmark {
  id: string
  title: string
  url: string
  user_id: string
  created_at: string
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

// Combined loading state
export interface LoadingState {
  initial: boolean
  saving: boolean
  fetchingTitle: boolean
}

// Combined form state
export interface FormState  {
  title: string
  url: string
  editingId: string | null
  titleStatus: "idle" | "fetching-html" | "fetching-ai" | "not-found" | "success"
  isDuplicate: boolean
  duplicateBookmark?: Bookmark
}

// Delete dialog state
export interface DeleteState  {
  isOpen: boolean
  bookmarkId: string
  bookmarkTitle: string
}