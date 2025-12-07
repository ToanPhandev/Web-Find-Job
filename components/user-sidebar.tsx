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
import { Button } from '@/components/ui/button'

const ADMIN_EMAIL = 'toan.pbsg@gmail.com'

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

    const isActive = (path: string) => pathname === path

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="mb-6">
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
                                    <span className="truncate text-xs">Cổng thông tin việc làm</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    {user?.email === ADMIN_EMAIL && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="group-data-[collapsible=icon]:!justify-center mt-2"
                            >
                                <Link href="/admin">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
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

            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            isActive={isActive('/')}
                            tooltip="Tìm việc làm"
                            className="group-data-[collapsible=icon]:!justify-center"
                        >
                            <Link href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Search className="size-4" />
                                </div>
                                <span className="group-data-[collapsible=icon]:hidden">Tìm việc làm</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            isActive={isActive('/my-applications')}
                            tooltip="Việc đã ứng tuyển"
                            className="group-data-[collapsible=icon]:!justify-center"
                        >
                            <Link href="/my-applications">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <FileText className="size-4" />
                                </div>
                                <span className="group-data-[collapsible=icon]:hidden">Việc đã ứng tuyển</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            isActive={isActive('/profile')}
                            tooltip="Hồ sơ của tôi"
                            className="group-data-[collapsible=icon]:!justify-center"
                        >
                            <Link href="/profile">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <User className="size-4" />
                                </div>
                                <span className="group-data-[collapsible=icon]:hidden">Hồ sơ của tôi</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!justify-center"
                                    >
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gray-200 text-gray-700 font-bold uppercase">
                                            {user?.email?.[0] || <User2 className="size-4" />}
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                            <span className="truncate font-semibold uppercase">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}</span>
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
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50">
                                        <LogOut className="mr-2 size-4" />
                                        Đăng xuất
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="group-data-[collapsible=icon]:!justify-center"
                            >
                                <Link href="/login">
                                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
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
