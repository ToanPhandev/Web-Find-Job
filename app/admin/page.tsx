'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Briefcase, FileText, Clock, CheckCircle, ExternalLink } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

// Interface cho Ứng viên (Sửa full_name -> fullname)
interface Application {
    id: string
    fullname: string // <-- QUAN TRỌNG: Phải khớp với cột 'fullname' trong DB
    email: string
    created_at: string
    status: string
    jobs: {
        title: string
    } | null
}

export default function AdminDashboard() {
    const supabase = createClient()
    const [isLoading, setIsLoading] = useState(true)

    // State lưu các con số thống kê
    const [stats, setStats] = useState({
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        pendingApplications: 0
    })

    // State lưu danh sách đơn mới nhất
    const [recentApplications, setRecentApplications] = useState<Application[]>([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // 1. Fetch các con số thống kê (Chạy song song cho nhanh)
                const [
                    { count: totalJobs },
                    { count: activeJobs },
                    { count: totalApplications },
                    { count: pendingApplications },
                    { data: recentAppsData }
                ] = await Promise.all([
                    supabase.from('jobs').select('*', { count: 'exact', head: true }),
                    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
                    supabase.from('applications').select('*', { count: 'exact', head: true }),
                    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                    // Lấy 5 đơn mới nhất
                    supabase
                        .from('applications')
                        .select('*, jobs(title)')
                        .order('created_at', { ascending: false })
                        .limit(5)
                ])

                setStats({
                    totalJobs: totalJobs || 0,
                    activeJobs: activeJobs || 0,
                    totalApplications: totalApplications || 0,
                    pendingApplications: pendingApplications || 0
                })

                if (recentAppsData) {
                    setRecentApplications(recentAppsData as any)
                }

            } catch (error) {
                console.error('Error loading dashboard:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Tổng số Job</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJobs}</h3>
                        <p className="text-xs text-gray-400 mt-1">Công việc trên hệ thống</p>
                    </div>
                    <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <Briefcase className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Job đang tuyển</p>
                        <h3 className="text-3xl font-bold text-green-600 mt-2">{stats.activeJobs}</h3>
                        <p className="text-xs text-gray-400 mt-1">Vị trí đang mở</p>
                    </div>
                    <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                        <CheckCircle className="h-6 w-6" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Đơn ứng tuyển</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalApplications}</h3>
                        <p className="text-xs text-gray-400 mt-1">Tổng số hồ sơ nhận được</p>
                    </div>
                    <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                        <FileText className="h-6 w-6" />
                    </div>
                </div>

                <div className={`bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between ${stats.pendingApplications > 0 ? 'ring-1 ring-orange-200 bg-orange-50/30' : ''}`}>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Đang chờ duyệt</p>
                        <h3 className={`text-3xl font-bold mt-2 ${stats.pendingApplications > 0 ? 'text-orange-600' : 'text-gray-900'}`}>
                            {stats.pendingApplications}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Hồ sơ cần xem xét</p>
                    </div>
                    <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                        <Clock className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Recent Applications Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Đơn ứng tuyển mới nhất</h2>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/applications" className="gap-2">
                            Xem tất cả <ExternalLink className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50">
                                <TableHead className="w-[30%] pl-6">Ứng viên</TableHead>
                                <TableHead className="w-[40%]">Vị trí</TableHead>
                                <TableHead className="w-[30%] text-right pr-6">Ngày nộp</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                                        Chưa có đơn ứng tuyển nào.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentApplications.map((app) => (
                                    <TableRow key={app.id} className="hover:bg-gray-50/50">
                                        <TableCell className="pl-6">
                                            <div className="flex flex-col">
                                                {/* SỬA Ở ĐÂY: Dùng app.fullname thay vì app.full_name */}
                                                <span className="font-semibold text-gray-900">
                                                    {app.fullname || 'N/A'}
                                                </span>
                                                <span className="text-xs text-gray-500">{app.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-xs">
                                                {app.jobs?.title || 'Job Deleted'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 text-gray-600">
                                            {format(new Date(app.created_at), 'dd/MM/yyyy')}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}