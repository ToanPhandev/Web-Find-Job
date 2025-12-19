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
} from '@/components/ui/sidebar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = React.useState<User | null>(null)

    React.useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()
    }, [supabase])

    const isActive = (path: string) => pathname === path

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
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
                                    <span className="truncate text-xs">Về Trang Chủ</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            isActive={isActive('/admin')}
                            tooltip="Dashboard"
                            className="group-data-[collapsible=icon]:!justify-center"
                        >
                            <Link href="/admin">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <LayoutDashboard className="size-4" />
                                </div>
                                <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            isActive={isActive('/admin/jobs/new')}
                            tooltip="Tuyển dụng"
                            className="group-data-[collapsible=icon]:!justify-center"
                        >
                            <Link href="/admin/jobs/new">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <Briefcase className="size-4" />
                                </div>
                                <span className="group-data-[collapsible=icon]:hidden">Tuyển dụng</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            size="lg"
                            isActive={isActive('/admin/applications')}
                            tooltip="Đơn ứng tuyển"
                            className="group-data-[collapsible=icon]:!justify-center"
                        >
                            <Link href="/admin/applications">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <FileText className="size-4" />
                                </div>
                                <span className="group-data-[collapsible=icon]:hidden">Đơn ứng tuyển</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>

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
                                        {user?.email?.[0] || <User2 className="size-4" />}
                                    </div>
                                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                        <span className="truncate font-semibold uppercase">{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin'}</span>
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
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
