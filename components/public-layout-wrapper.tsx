'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { UserSidebar } from '@/components/user-sidebar'

export function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAdminPage = pathname?.startsWith('/admin')

    if (isAdminPage) {
        return <>{children}</>
    }

    return (
        <SidebarProvider>
            <UserSidebar />
            <main className="w-full bg-gray-50 min-h-screen transition-all duration-300 ease-in-out">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 sticky top-0 z-10">
                    <SidebarTrigger className="-ml-1" />
                </header>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
