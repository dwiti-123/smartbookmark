"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { BookmarkIcon, LogOut, Trash2, Edit2, Plus, Grid3x3, List, AlertCircle, Loader, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"
import { Toaster, toast } from "sonner"
import DeleteConfirmDialog from "@/components/DeleteConfirmModal"
import Pagination from "@/components/PaginationModal"
import {
  fetchBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
  subscribeToBookmarks,
  checkDuplicate,
  fetchPageTitle,
  generateTitleWithAI,
} from "@/services/bookmark"
import { DeleteState, FormState, LoadingState } from "@/types/type"

interface Bookmark {
  id: string
  title: string
  url: string
  user_id: string
  created_at: string
}

const quotes = [
  "The best time to save a bookmark is now.",
  "Organize your thoughts, organize your bookmarks.",
  "Every great bookmark journey starts with one save.",
  "Keep your digital life tidy.",
  "Your future self will thank you for saving this.",
  "Information is only useful if you can find it.",
  "Save now, thank yourself later.",
]

const ITEMS_PER_PAGE = 6

const SkeletonCard = () => (
  <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
    <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
  </div>
)



export default function BookmarksPage() {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([])
  const [user, setUser] = useState<any>(null)
  const [quote, setQuote] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [viewMode, setViewMode] = useState<"card" | "table">("card")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Combined loading state - single object
  const [loading, setLoading] = useState<LoadingState>({
    initial: true,
    saving: false,
    fetchingTitle: false,
  })

  // Combined form state - single object
  const [form, setForm] = useState<FormState>({
    title: "",
    url: "",
    editingId: null,
    titleStatus: "idle",
    isDuplicate: false,
  })

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<DeleteState>({
    isOpen: false,
    bookmarkId: "",
    bookmarkTitle: "",
  })

  // Set random quote
  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)])
  }, [])

  // Filter and search bookmarks
  useEffect(() => {
    let filtered = bookmarks
    if (searchQuery.trim()) {
      filtered = bookmarks.filter((b) =>
        b.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredBookmarks(filtered)
    setCurrentPage(1)
  }, [searchQuery, bookmarks])

  // Calculate pagination
  const totalPages = Math.ceil(filteredBookmarks.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedBookmarks = filteredBookmarks.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Load bookmarks
  const loadBookmarks = async () => {
    try {
      const data = await fetchBookmarks()
      setBookmarks(data)
    } catch (err) {
      toast.error("Failed to fetch bookmarks")
    } finally {
      setLoading((prev) => ({ ...prev, initial: false }))
    }
  }

  // Check login on mount
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const checkUser = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) {
        router.push("/")
      } else {
        setUser(data.session.user)
        await loadBookmarks()
        unsubscribe = subscribeToBookmarks(loadBookmarks)
      }
    }

    checkUser()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [router])

  // Check for duplicate when URL changes
  const handleUrlChange = async (newUrl: string) => {
    setForm((prev) => ({
      ...prev,
      url: newUrl,
      titleStatus: "idle",
      isDuplicate: false,
    }))

    if (!newUrl.trim() || form.editingId) return
    if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) return

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id
      if (!userId) return

      const { isDuplicate, existingBookmark } = await checkDuplicate(userId, newUrl)
      setForm((prev) => ({
        ...prev,
        isDuplicate,
        duplicateBookmark: existingBookmark,
      }))
    } catch (err) {
      // Silent error
    }
  }

  // Smart title detection - HTML first, then AI
  const handleGetTitle = async () => {
    if (!form.url.trim()) {
      toast.error("Please enter a URL first")
      return
    }

    if (!form.url.startsWith("http://") && !form.url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://")
      return
    }

    setLoading((prev) => ({ ...prev, fetchingTitle: true }))
    setForm((prev) => ({ ...prev, titleStatus: "fetching-html" }))

    try {
      // Step 1: Try HTML
      const htmlTitle = await fetchPageTitle(form.url)
      if (htmlTitle) {
        setForm((prev) => ({
          ...prev,
          title: htmlTitle,
          titleStatus: "success",
        }))
        toast.success("Title detected!")
        setLoading((prev) => ({ ...prev, fetchingTitle: false }))
        return
      }

      // Step 2: Try AI
      setForm((prev) => ({ ...prev, titleStatus: "fetching-ai" }))
      const aiTitle = await generateTitleWithAI(form.url)
      if (aiTitle) {
        setForm((prev) => ({
          ...prev,
          title: aiTitle,
          titleStatus: "success",
        }))
        toast.success("Title generated with AI!")
      } else {
        setForm((prev) => ({ ...prev, titleStatus: "not-found" }))
        toast.error("Could not detect title - please type manually")
      }
    } catch (err) {
      setForm((prev) => ({ ...prev, titleStatus: "not-found" }))
      toast.error("Failed to get title")
    } finally {
      setLoading((prev) => ({ ...prev, fetchingTitle: false }))
    }
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("Please enter both title and URL")
      return
    }

    if (!form.url.startsWith("http://") && !form.url.startsWith("https://")) {
      toast.error("URL must start with http:// or https://")
      return
    }

    setLoading((prev) => ({ ...prev, saving: true }))

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        toast.error("User not logged in")
        return
      }

      if (!form.editingId) {
        const { isDuplicate } = await checkDuplicate(userId, form.url.trim())
        if (isDuplicate) {
          toast.error("You already have this bookmark saved!")
          setLoading((prev) => ({ ...prev, saving: false }))
          return
        }
      }

      if (form.editingId) {
        await updateBookmark(form.editingId, userId, form.title.trim(), form.url.trim())
        toast.success("Updated!")
      } else {
        await addBookmark(userId, form.title.trim(), form.url.trim())
        toast.success("Saved!")
      }

      resetForm()
      setShowForm(false)
      loadBookmarks()
    } catch (err) {
      toast.error("Error saving bookmark")
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }))
    }
  }

  const handleEdit = (b: Bookmark) => {
    setForm({
      title: b.title,
      url: b.url,
      editingId: b.id,
      titleStatus: "idle",
      isDuplicate: false,
    })
    setShowForm(true)
  }

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      bookmarkId: id,
      bookmarkTitle: title,
    })
  }

  const handleConfirmDelete = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        toast.error("User not logged in")
        return
      }

      await deleteBookmark(deleteDialog.bookmarkId, userId)
      toast.success("Deleted!")
      setDeleteDialog({ isOpen: false, bookmarkId: "", bookmarkTitle: "" })
      loadBookmarks()
    } catch (err) {
      toast.error("Error deleting bookmark")
    }
  }

  const resetForm = () => {
    setForm({
      title: "",
      url: "",
      editingId: null,
      titleStatus: "idle",
      isDuplicate: false,
    })
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookmarkIcon className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold">SaveLink</span>
          </div>

          <div className="flex items-center gap-6">
            {user && <p className="text-sm text-gray-600">{user.email}</p>}
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Greeting & Quote */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hi {user?.user_metadata?.name || "there"}! 👋
          </h1>
          <p className="text-base text-gray-600 italic">"{quote}"</p>
        </div>

        {/* Add Bookmark Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {form.editingId ? "Edit Bookmark" : "Add New Bookmark"}
            </h2>

            <div className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleGetTitle}
                    disabled={!form.url.trim() || loading.fetchingTitle}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition font-medium text-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    {loading.fetchingTitle ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        {form.titleStatus === "fetching-html" ? "Detecting..." : "Generating..."}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Get Title
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Click "Get Title" to auto-detect from webpage
                </p>
              </div>

              {/* Status Messages */}
              {form.titleStatus === "fetching-html" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-3">
                  <Loader className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">Checking webpage...</p>
                    <p className="text-blue-800 text-xs mt-0.5">Looking for title tag</p>
                  </div>
                </div>
              )}

              {form.titleStatus === "fetching-ai" && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex gap-3">
                  <Loader className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5 animate-spin" />
                  <div className="text-sm">
                    <p className="font-medium text-purple-900">Using AI to generate title...</p>
                    <p className="text-purple-800 text-xs mt-0.5">This may take a moment</p>
                  </div>
                </div>
              )}

              {form.titleStatus === "not-found" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900">Could not detect title</p>
                    <p className="text-amber-800 text-xs mt-0.5">Please enter a title manually</p>
                  </div>
                </div>
              )}

              {form.titleStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3">
                  <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
                  <div className="text-sm">
                    <p className="font-medium text-green-900">Title detected!</p>
                  </div>
                </div>
              )}

              {/* Duplicate Warning */}
              {form.isDuplicate && form.duplicateBookmark && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-900">You already saved this bookmark!</p>
                    <p className="text-yellow-800 text-xs mt-1">
                      Saved as: <strong>{form.duplicateBookmark.title}</strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          editingId: form.duplicateBookmark!.id,
                          title: form.duplicateBookmark!.title,
                          url: form.duplicateBookmark!.url,
                          isDuplicate: false,
                        }))
                      }}
                      className="text-yellow-700 hover:text-yellow-900 underline mt-2 text-xs font-medium"
                    >
                      Edit existing →
                    </button>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter bookmark title..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading.saving || form.isDuplicate}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition font-medium text-sm"
                >
                  {loading.saving ? "Saving..." : form.editingId ? "Update" : "Save Bookmark"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 border border-gray-300 text-gray-900 py-2.5 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        {!showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                <Plus className="w-5 h-5" />
                Add Bookmark
              </button>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title..."
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />

              <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("card")}
                  className={`p-2 rounded transition ${
                    viewMode === "card" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Card view"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-2 rounded transition ${
                    viewMode === "table" ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
                  }`}
                  title="Table view"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            {filteredBookmarks.length > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, filteredBookmarks.length)} of{" "}
                {filteredBookmarks.length}
                {searchQuery && ` (filtered from ${bookmarks.length} total)`}
              </p>
            )}
          </div>
        )}

        {/* Bookmarks List */}
        {loading.initial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : paginatedBookmarks.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
            <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">
              {searchQuery ? "No bookmarks match your search" : "No bookmarks yet"}
            </p>
            {!searchQuery && (
              <p className="text-gray-500 text-sm">Click "Add Bookmark" to save your first link</p>
            )}
          </div>
        ) : viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition flex flex-col group"
              >
                <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2">
                  {bookmark.title}
                </h3>
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 truncate block mb-3"
                  title={bookmark.url}
                >
                  {bookmark.url}
                </a>
                <p className="text-xs text-gray-500 mb-4">
                  {new Date(bookmark.created_at).toLocaleDateString()}
                </p>

                <div className="flex gap-2 mt-auto opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => handleEdit(bookmark)}
                    className="flex-1 py-2 px-3 text-sm text-blue-600 hover:bg-blue-50 rounded transition font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(bookmark.id, bookmark.title)}
                    className="flex-1 py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">URL</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBookmarks.map((bookmark, index) => (
                  <tr
                    key={bookmark.id}
                    className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 line-clamp-1">
                      {bookmark.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-700 truncate block"
                        title={bookmark.url}
                      >
                        {bookmark.url}
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => handleEdit(bookmark)}
                        className="text-blue-600 hover:text-blue-700 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(bookmark.id, bookmark.title)}
                        className="text-red-600 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Component */}
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </main>

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteDialog({ isOpen: false, bookmarkId: "", bookmarkTitle: "" })}
        bookmarkTitle={deleteDialog.bookmarkTitle}
      />
    </div>
  )
}