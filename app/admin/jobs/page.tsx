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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Job {
    id: string
    title: string
    company: string
    status: 'active' | 'draft' | 'closed'
    created_at: string
}

export default function AdminJobsPage() {
    const supabase = createClient()
    const router = useRouter()
    const [jobs, setJobs] = useState<Job[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchJobs()
    }, [])

    const fetchJobs = async () => {
        setIsLoading(true)
        try {
            const { data, error } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data) {
                setJobs(data as Job[])
            }
        } catch (error: any) {
            console.error('Error fetching jobs:', error)
            toast.error('Không thể tải danh sách công việc')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này không?')) return

        try {
            const { error } = await supabase
                .from('jobs')
                .delete()
                .eq('id', id)

            if (error) throw error

            setJobs(jobs.filter((job) => job.id !== id))
            toast.success('Xóa công việc thành công')
        } catch (error: any) {
            console.error('Error deleting job:', error)
            toast.error('Không thể xóa công việc')
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-600 hover:bg-green-700">Đang tuyển</Badge>
            case 'draft':
                return <Badge variant="secondary" className="bg-gray-200 text-gray-700 hover:bg-gray-300">Bản nháp</Badge>
            case 'closed':
                return <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">Đã đóng</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý việc làm</h1>
                    <p className="text-gray-500 mt-2">Danh sách tất cả các tin tuyển dụng trên hệ thống.</p>
                </div>
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/admin/jobs/new">
                        <Plus className="mr-2 h-4 w-4" /> Đăng tin mới
                    </Link>
                </Button>
            </div>

            <div className="bg-white border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[35%]">Tiêu đề</TableHead>
                            <TableHead className="w-[20%]">Công ty</TableHead>
                            <TableHead className="w-[150px] text-center">Trạng thái</TableHead>
                            <TableHead className="w-[150px] text-center whitespace-nowrap">Ngày đăng</TableHead>
                            <TableHead className="w-[100px] text-center">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                        <span className="ml-2 text-gray-500">Đang tải dữ liệu...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : jobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    Chưa có tin tuyển dụng nào.
                                </TableCell>
                            </TableRow>
                        ) : (
                            jobs.map((job) => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <div className="truncate max-w-[300px]" title={job.title}>
                                            {job.title}
                                        </div>
                                    </TableCell>
                                    <TableCell>{job.company}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(job.status)}</TableCell>
                                    <TableCell className="text-center whitespace-nowrap">
                                        {format(new Date(job.created_at), 'dd/MM/yyyy')}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => router.push(`/admin/jobs/${job.id}`)}
                                                title="Chỉnh sửa"
                                            >
                                                <Edit className="h-4 w-4 text-gray-500 hover:text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(job.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                title="Xóa"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
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
