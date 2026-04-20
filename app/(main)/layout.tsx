// @/app/(main)/layout.tsx

"use client"

import dynamic from "next/dynamic"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { MainHeader } from "./_components/ui/main-header"
import { ConfigProvider } from "./_context/config-context"
import { ScopeProvider } from "./_context/scope-context"
import { UploadDialogProvider, useUploadDialog } from "./_context/upload-dialog-context"
import { HeaderToolbarProvider } from "./_context/header-toolbar-context"
import { UploadConfigDialog } from "./_components/ui/upload-config-dialog"

// Skip SSR for the sidebar — Base UI generates aria/tooltip IDs using an
// internal counter that diverges between server and client renders, causing
// hydration mismatches on navigation. Client-only rendering eliminates this.
const MainSidebar = dynamic(
  () => import("./_components/ui/main-sidebar").then((m) => m.MainSidebar),
  { ssr: false }
)

interface MainLayoutProps {
  children: React.ReactNode
}

// Inner layout consumes the upload dialog context
function MainLayoutInner({ children }: MainLayoutProps) {
  const { open, openDialog, closeDialog } = useUploadDialog()

  return (
    <>
      <SidebarProvider className="size-full">
        <MainSidebar />
        <SidebarInset className="min-w-0">
          <MainHeader />
          <div className="flex flex-1 flex-col min-h-0 min-w-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      <UploadConfigDialog
        open={open}
        onOpenChange={(val) => (val ? openDialog() : closeDialog())}
      />
    </>
  )
}

// Outer layout provides all contexts
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <ConfigProvider>
      <ScopeProvider>
        <UploadDialogProvider>
          <HeaderToolbarProvider>
            <MainLayoutInner>{children}</MainLayoutInner>
          </HeaderToolbarProvider>
        </UploadDialogProvider>
      </ScopeProvider>
    </ConfigProvider>
  )
}
