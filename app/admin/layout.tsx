'use client'

import React from 'react'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app_sidebar"
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            {/* Sidebar chứa cả nút Home và Menu */}
            <AppSidebar />

            <main className="w-full bg-gray-50 min-h-screen transition-all duration-300 ease-in-out">
                {/* Header chỉ chứa nút đóng mở và tiêu đề trang */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="h-6 w-px bg-gray-200 mx-2" />
                    <h1 className="font-semibold text-gray-800">Admin Portal</h1>
                </header>

                <div className="p-6">
                    {children}
                </div>
            </main>
            <Toaster position="top-center" />
        </SidebarProvider>
    )
}