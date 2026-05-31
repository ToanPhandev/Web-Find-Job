import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user-sidebar";
import { ToggleTheme } from "@/components/ToggleTheme";

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
                <main className="flex-1 w-full bg-muted">

                    {/* THANH HEADER: Chứa nút đóng/mở sidebar */}
                    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card text-card-foreground px-4 sticky top-0 z-50 shadow-sm">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                        </div>
                        <ToggleTheme />
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