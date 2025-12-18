'use client'

import * as React from 'react'
import {
    Briefcase,
    ChevronsUp,
    FileText,
    Home,
    LayoutDashboard,
    LogIn,
    LogOut,
    Search,
    User,
    User2,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const ADMIN_EMAIL = 'toan.pbsg@gmail.com'

// 1. Định nghĩa danh sách menu ở đây cho gọn
const navItems = [
    {
        title: "Tìm việc làm",
        url: "/", // Hoặc /jobs tùy route của bạn
        icon: Search,
    },
    {
        title: "Việc đã ứng tuyển",
        url: "/my-applications",
        icon: FileText,
    },
    {
        title: "Hồ sơ của tôi",
        url: "/profile",
        icon: User,
    },
]

export function UserSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = React.useState<SupabaseUser | null>(null)

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* --- HEADER: Chứa Logo & Link Admin --- */}
            <SidebarHeader className="mb-2">
                <SidebarMenu>
                    {/* Item 1: Logo App */}
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <Home className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-semibold">Find Job</span>
                                    <span className="truncate text-xs">Cổng thông tin việc làm</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    {/* Item 2: Admin Portal (Chỉ hiện nếu là Admin) */}
                    {user?.email === ADMIN_EMAIL && (
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/admin">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 border">
                                        <LayoutDashboard className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold">Admin Portal</span>
                                        <span className="truncate text-xs">Trang Quản Trị</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarHeader>

            {/* --- CONTENT: Danh sách Menu chính --- */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {/* QUAN TRỌNG: 
                                        - Bỏ size="lg" ở đây để dùng size chuẩn của item
                                        - Bỏ thẻ div bao quanh icon -> Icon tự căn thẳng hàng với text
                                    */}
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={item.title}
                                        isActive={pathname === item.url}
                                    >
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* --- FOOTER: User Profile / Login --- */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold uppercase border border-blue-200">
                                            {user?.email?.[0] || <User2 className="size-4" />}
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                            <span className="truncate font-semibold uppercase">
                                                {user?.user_metadata?.full_name || 'User'}
                                            </span>
                                            <span className="truncate text-xs">{user?.email}</span>
                                        </div>
                                        <ChevronsUp className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                                        <LogOut className="mr-2 size-4" />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SidebarMenuButton size="lg" asChild>
                                <Link href="/login">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-zinc-900 text-white">
                                        <LogIn className="size-4" />
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold">Đăng nhập</span>
                                        <span className="truncate text-xs">hoặc Đăng ký</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}