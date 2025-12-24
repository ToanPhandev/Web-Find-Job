'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Loader2, FileText, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface Application {
    id: string
    fullname: string
    email: string
    cv_url: string
    created_at: string
    status: string
    jobs: {
        title: string
    } | null
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Đang chờ', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    { value: 'reviewed', label: 'Đã xem', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { value: 'interview', label: 'Phỏng vấn', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    { value: 'hired', label: 'Đã tuyển', color: 'text-green-600 bg-green-50 border-green-200' },
    { value: 'rejected', label: 'Từ chối', color: 'text-red-600 bg-red-50 border-red-200' },
]

export default function AdminApplicationsPage() {
    const supabase = createClient()
    const [applications, setApplications] = useState<Application[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    jobs (
                        title
                    )
                `)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setApplications(data as Application[])
            }
        } catch (error: any) {
            console.error('Error fetching applications:', error)
            toast.error('Không thể tải danh sách đơn ứng tuyển')
        } finally {
            setIsLoading(false)
        }
    }

    const handleStatusChange = async (id: string, newStatus: string) => {
        // Optimistic update (Cập nhật giao diện ngay lập tức)
        setApplications(prev => prev.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ))

        try {
            const { error } = await supabase
                .from('applications')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error

            toast.success('Đã cập nhật trạng thái')
        } catch (error: any) {
            console.error('Error updating status:', error)
            toast.error('Cập nhật thất bại: ' + error.message)
            // Revert on error (hoặc fetch lại data)
            fetchApplications()
        }
    }

    const getStatusColorClass = (status: string) => {
        const option = STATUS_OPTIONS.find(o => o.value === status)
        return option ? option.color : 'text-gray-600 bg-gray-50 border-gray-200'
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản lý đơn ứng tuyển</h1>
                <p className="text-gray-500 mt-2">Xem và quản lý tất cả các hồ sơ ứng viên gửi về hệ thống.</p>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50/50">
                            <TableHead className="w-[250px]">Ứng viên</TableHead>
                            <TableHead className="min-w-[200px]">Vị trí ứng tuyển</TableHead>
                            <TableHead className="w-[100px] text-center">CV</TableHead>
                            <TableHead className="w-[120px] text-center whitespace-nowrap">Ngày nộp</TableHead>
                            <TableHead className="w-[180px] text-center">Trạng thái</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                        <span className="text-gray-500">Đang tải dữ liệu...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : applications.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    Chưa có đơn ứng tuyển nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            applications.map((app) => (
                                <TableRow key={app.id} className="hover:bg-gray-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{app.fullname || 'N/A'}</span>
                                            <span className="text-sm text-gray-500">{app.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-md text-xs">
                                            {app.jobs?.title || 'Job Deleted'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {app.cv_url ? (
                                            <Button variant="outline" size="sm" asChild className="gap-2 h-8">
                                                <Link href={app.cv_url} target="_blank">
                                                    <FileText className="h-3.5 w-3.5" />
                                                    <span>Xem CV</span>
                                                </Link>
                                            </Button>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">Không có file</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-gray-600 text-center whitespace-nowrap">
                                        {format(new Date(app.created_at), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Select
                                            value={app.status || 'pending'}
                                            onValueChange={(value) => handleStatusChange(app.id, value)}
                                        >
                                            <SelectTrigger
                                                className={`h-9 w-full ${getStatusColorClass(app.status || 'pending')} focus:ring-0 focus:ring-offset-0 font-medium`}
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
