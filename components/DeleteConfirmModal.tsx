import { AlertCircle } from "lucide-react"

export default function DeleteConfirmDialog  ({
  isOpen,
  onConfirm,
  onCancel,
  bookmarkTitle,
}: {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  bookmarkTitle: string
})  {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 px-6">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Delete bookmark?</h3>
            <p className="text-sm text-gray-600 mt-1">
              You're about to delete "<span className="font-medium">{bookmarkTitle}</span>". This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}