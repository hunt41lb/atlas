// @/app/(main)/_context/upload-dialog-context.tsx

"use client"

import * as React from "react"

interface UploadDialogContextProps {
  open: boolean
  openDialog: () => void
  closeDialog: () => void
}

const UploadDialogContext = React.createContext<UploadDialogContextProps | null>(null)

export function useUploadDialog() {
  const context = React.useContext(UploadDialogContext)
  if (!context) {
    throw new Error("useUploadDialog must be used within an UploadDialogProvider.")
  }
  return context
}

export function UploadDialogProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  const contextValue = React.useMemo(() => ({
    open,
    openDialog: () => setOpen(true),
    closeDialog: () => setOpen(false),
  }), [open])

  return (
    <UploadDialogContext.Provider value={contextValue}>
      {children}
    </UploadDialogContext.Provider>
  )
}
