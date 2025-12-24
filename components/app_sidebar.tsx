'use client'

import * as React from 'react'
import {
    Briefcase,
    ChevronsUp,
    FileText,
    Home,
    LayoutDashboard,
    LogOut,
    User2,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarGroup,        // Thêm mới
    SidebarGroupContent, // Thêm mới
    SidebarGroupLabel,   // Thêm mới
} from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// 1. Định nghĩa danh sách menu ở ngoài cho gọn code
const MENU_ITEMS = [
    {
        title: "Dashboard",
        url: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Tuyển dụng",
        url: "/admin/jobs",
        icon: Briefcase,
    },
    {
        title: "Đơn ứng tuyển",
        url: "/admin/applications",
        icon: FileText,
    },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = React.useState<User | null>(null)

    // Giữ nguyên logic lấy User của bạn
    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            {/* --- PHẦN HEADER: CHỨA NÚT VỀ TRANG CHỦ (ĐỂ THẲNG HÀNG) --- */}
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="group-data-[collapsible=icon]:!justify-center"
                        >
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                                    <Home className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="truncate font-semibold">Find Job</span>
                                    <span className="truncate text-xs">Về Trang Chủ</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* --- PHẦN CONTENT: MENU CHỨC NĂNG --- */}
            <SidebarContent>
                <SidebarGroup>
                    {/* Label này sẽ ẩn khi đóng sidebar */}
                    <SidebarGroupLabel>Quản trị</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {MENU_ITEMS.map((item) => {
                                // Logic Active
                                const isActive = pathname === item.url || (pathname.startsWith(item.url) && item.url !== '/admin')

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            size="lg" // Dùng size lg để khớp với Header
                                            isActive={isActive}
                                            tooltip={item.title}
                                            className="group-data-[collapsible=icon]:!justify-center"
                                        >
                                            <Link href={item.url}>
                                                {/* Icon */}
                                                <item.icon className="size-4" />
                                                {/* Text */}
                                                <span className="group-data-[collapsible=icon]:hidden">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                )
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* --- PHẦN FOOTER: GIỮ NGUYÊN LOGIC USER CỦA BẠN --- */}
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!justify-center"
                                >
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200 text-gray-700 font-bold uppercase">
                                        {/* Fallback avatar */}
                                        {user?.email?.[0] || <User2 className="size-4" />}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold uppercase">
                                            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}
                                        </span>
                                        <span className="truncate text-xs">{user?.email || 'Loading...'}</span>
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
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 cursor-pointer">
                                    <LogOut className="mr-2 size-4" />
                                    Đăng xuất
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}