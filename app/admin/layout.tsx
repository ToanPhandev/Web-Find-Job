'use client'

import React from 'react'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app_sidebar"
import { Toaster } from 'react-hot-toast'
import { ToggleTheme } from "@/components/ToggleTheme"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* Sidebar chứa cả nút Home và Menu */}
            <AppSidebar />

            <main className="w-full bg-muted min-h-screen transition-all duration-300 ease-in-out">
                {/* Header chỉ chứa nút đóng mở và tiêu đề trang */}
                <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card text-card-foreground px-4">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <div className="h-6 w-px bg-muted mx-2" />
                        <h1 className="font-semibold text-foreground">Admin Portal</h1>
                    </div>
                    <ToggleTheme />
                </header>

                <div className="p-6">
                    {children}
                </div>
            </main>
            <Toaster position="top-center" />
        </SidebarProvider>
    )
}