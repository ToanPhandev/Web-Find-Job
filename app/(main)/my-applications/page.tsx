'use client'

import React, { useState, useEffect } from 'react'
import {
    Building2,
    Calendar as CalendarIcon,
    CalendarDays,
    CheckCircle,
    Clock,
    MapPin,
    MoreVertical,
    Search,
    XCircle,
    Eye,
    Trash2,
    ClipboardList,
    X,
    Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createClient } from '@/utils/supabase/client' // Import Supabase Client

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

import ArkCalendar, { DateRange } from '@/components/ui/ark-calendar'

type ApplicationStatus = 'pending' | 'interview' | 'rejected' | 'offered'

interface Application {
    id: string
    jobTitle: string
    company: string
    location: string
    appliedDate: string // Lưu dạng string cho dễ hiển thị
    rawDate: string // Lưu dạng gốc để so sánh ngày
    status: ApplicationStatus
    logoInitial: string
    logoColor: string
}

// Hàm helper để tạo màu ngẫu nhiên cho đẹp
const getRandomColor = (char: string) => {
    const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-green-600', 'bg-red-500', 'bg-orange-500'];
    const index = char.charCodeAt(0) % colors.length;
    return colors[index];
}

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
    switch (status) {
        case 'pending':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 gap-1.5 px-3 py-1"><Clock className="size-3.5" /> Đang chờ</Badge>
        case 'interview':
            return <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1.5 px-3 py-1"><CalendarIcon className="size-3.5" /> Phỏng vấn</Badge>
        case 'offered':
            return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 gap-1.5 px-3 py-1"><CheckCircle className="size-3.5" /> Đã nhận</Badge>
        case 'rejected':
            return <Badge variant="secondary" className="bg-red-100 text-red-700 hover:bg-red-100 gap-1.5 px-3 py-1"><XCircle className="size-3.5" /> Từ chối</Badge>
        default:
            return null
    }
}

export default function MyApplicationsPage() {
    const supabase = createClient()
    const [applications, setApplications] = useState<Application[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [date, setDate] = useState<DateRange>({ start: undefined, end: undefined })

    // 1. Fetch Dữ liệu thật từ Supabase
    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Query bảng applications và join với bảng jobs
                const { data, error } = await supabase
                    .from('applications')
                    .select(`
                        id,
                        status,
                        created_at,
                        jobs (
                            title,
                            location
                        )
                    `)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error

                if (data) {
                    // Map dữ liệu từ DB sang định dạng hiển thị
                    const mappedData: Application[] = data.map((item: any) => {
                        const jobTitle = item.jobs?.title || 'Công việc không xác định'
                        return {
                            id: item.id,
                            jobTitle: jobTitle,
                            company: 'Công ty Tuyển dụng', // Tạm thời để hardcode vì bảng jobs chưa có cột company
                            location: item.jobs?.location || 'Remote',
                            appliedDate: format(new Date(item.created_at), 'dd/MM/yyyy'),
                            rawDate: item.created_at,
                            status: item.status as ApplicationStatus,
                            logoInitial: jobTitle.charAt(0).toUpperCase(),
                            logoColor: getRandomColor(jobTitle)
                        }
                    })
                    setApplications(mappedData)
                }
            } catch (error) {
                console.error("Lỗi tải dữ liệu:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchApplications()
    }, [supabase])

    // 2. Hàm Xóa (Rút hồ sơ) - Đã sửa lỗi "Xóa giả"
    const handleWithdraw = async (id: string, jobTitle: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn rút hồ sơ vị trí "${jobTitle}" không?`)) return;

        try {
            // Lấy user hiện tại để đảm bảo bảo mật
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return;

            // Gọi API Xóa của Supabase
            const { error } = await supabase
                .from('applications')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id) // Rất quan trọng: Chỉ xóa nếu đúng là đơn của user này

            if (error) {
                console.error("Lỗi Supabase:", error)
                alert("Lỗi: " + error.message)
                return
            }

            // Nếu xóa thành công trên Server, mới cập nhật giao diện
            setApplications((prev) => prev.filter((app) => app.id !== id))
            alert("Đã rút hồ sơ thành công!")

        } catch (error) {
            console.error("Lỗi hệ thống:", error)
            alert("Có lỗi xảy ra, vui lòng thử lại.")
        }
    }

    const handleViewDetails = (jobTitle: string) => {
        alert(`Tính năng đang phát triển cho: ${jobTitle}`)
    }

    // Logic lọc dữ liệu (Giữ nguyên logic của bạn nhưng sửa phần parse ngày)
    const filteredApplications = applications.filter((app) => {
        const matchesStatus = filterStatus === 'all' || app.status === filterStatus
        const matchesSearch =
            app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.company.toLowerCase().includes(searchQuery.toLowerCase())

        let matchesDate = true
        if (date.start) {
            try {
                // Dùng rawDate (ISO string) để parse chính xác hơn
                const appliedDateObj = new Date(app.rawDate)

                if (!date.end) {
                    // So sánh cùng ngày (bỏ qua giờ phút)
                    matchesDate = format(appliedDateObj, 'dd/MM/yyyy') === format(date.start, 'dd/MM/yyyy')
                } else {
                    matchesDate = isWithinInterval(appliedDateObj, {
                        start: date.start,
                        end: date.end
                    })
                }
            } catch (e) {
                matchesDate = false
            }
        }

        return matchesStatus && matchesSearch && matchesDate
    })

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Việc đã ứng tuyển</h1>
                    <p className="text-gray-500 mt-2">Theo dõi trạng thái các hồ sơ ứng tuyển của bạn.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 size-4 text-gray-500" />
                        <Input
                            placeholder="Tìm công ty, vị trí..."
                            className="pl-9 w-full sm:w-60 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* --- LỊCH ARK UI --- */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-[240px] justify-start text-left font-normal bg-white",
                                    !date.start && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date.start ? (
                                    date.end ? (
                                        <>{format(date.start, "dd/MM/yyyy")} - {format(date.end, "dd/MM/yyyy")}</>
                                    ) : (
                                        format(date.start, "PPP", { locale: vi })
                                    )
                                ) : (
                                    <span>Chọn khoảng thời gian...</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent
                            className="w-auto p-0 border-none shadow-none bg-transparent pointer-events-auto"
                            align="end"
                        >
                            <ArkCalendar date={date} setDate={setDate} />
                        </PopoverContent>
                    </Popover>

                    {date.start && (
                        <Button variant="ghost" size="icon" onClick={() => setDate({ start: undefined, end: undefined })} title="Xóa lọc ngày">
                            <X className="size-4 text-gray-500" />
                        </Button>
                    )}

                    <div className="relative">
                        <select
                            className="h-10 w-full sm:w-40 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="pending">Đang chờ</option>
                            <option value="interview">Phỏng vấn</option>
                            <option value="offered">Đã nhận</option>
                            <option value="rejected">Bị từ chối</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => (
                        <div
                            key={app.id}
                            className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md hover:border-blue-100"
                        >
                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ${app.logoColor} text-white shadow-sm`}>
                                <span className="text-xl font-bold">{app.logoInitial}</span>
                            </div>

                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Link href="#" onClick={(e) => { e.preventDefault(); handleViewDetails(app.jobTitle); }} className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors truncate block">
                                        {app.jobTitle}
                                    </Link>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="size-3.5" />
                                        <span>{app.company}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="size-3.5" />
                                        <span>{app.location}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarDays className="size-3.5" />
                                        <span>Ngày nộp: {app.appliedDate}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-4 mt-2 sm:mt-0 pl-14 sm:pl-0">
                                <StatusBadge status={app.status} />

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 focus-visible:ring-0">
                                            <MoreVertical className="size-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                            onClick={() => handleViewDetails(app.jobTitle)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                                        </DropdownMenuItem>

                                        <DropdownMenuItem
                                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                            onClick={() => handleWithdraw(app.id, app.jobTitle)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Rút hồ sơ
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
                            <ClipboardList className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Không tìm thấy đơn ứng tuyển nào</h3>
                        <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                            {searchQuery || filterStatus !== 'all' || date.start
                                ? "Thử thay đổi bộ lọc ngày tháng hoặc từ khóa tìm kiếm."
                                : "Danh sách ứng tuyển đang trống."}
                        </p>
                        {(!searchQuery && filterStatus === 'all' && !date.start) && (
                            <Button className="mt-6 bg-blue-600 hover:bg-blue-700" asChild>
                                <Link href="/">Tìm việc ngay</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}