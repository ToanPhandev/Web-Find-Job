import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user-sidebar";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                {/* Sidebar bên trái */}
                <UserSidebar />

                {/* Nội dung chính bên phải */}
                <main className="flex-1 w-full bg-gray-50">

                    {/* THANH HEADER: Chứa nút đóng/mở sidebar */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4 sticky top-0 z-10 shadow-sm">
                        <SidebarTrigger className="-ml-1" />
                    </header>

                    {/* Nội dung trang */}
                    <div className="p-6">
                        {children}
                    </div>

                </main>
            </div>
        </SidebarProvider>
    );
}