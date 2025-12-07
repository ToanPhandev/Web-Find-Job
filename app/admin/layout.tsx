import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full bg-gray-50 min-h-screen transition-all duration-300 ease-in-out">
                {/* Header sạch sẽ: Chỉ có Trigger và Title */}
                <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="h-6 w-px bg-gray-200 mx-2" /> {/* Đường kẻ dọc ngăn cách */}
                    <h1 className="font-semibold text-gray-800">Admin Portal</h1>
                    {/* TUYỆT ĐỐI KHÔNG thêm bất kỳ nút Profile/Logout nào ở đây nữa */}
                </header>

                <div className="p-6">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    );
}
