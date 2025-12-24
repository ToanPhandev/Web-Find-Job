'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from 'react-hot-toast'
import { Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function EditJobPage() {
    const supabase = createClient()
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // State lưu dữ liệu Form
    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salary_range: '',
        job_type: 'Full-time',
        status: 'active',
        description: '',
        requirements: ''
    })

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error

                if (data) {
                    setFormData({
                        title: data.title || '',
                        company: data.company || '',
                        location: data.location || '',
                        salary_range: data.salary_range || '',
                        job_type: data.job_type || 'Full-time',
                        status: data.status || 'active',
                        description: data.description || '',
                        requirements: data.requirements || ''
                    })
                }
            } catch (error: any) {
                console.error('Error fetching job:', error)
                toast.error('Không thể tìm thấy thông tin công việc')
                router.push('/admin/jobs')
            } finally {
                setIsLoading(false)
            }
        }

        if (id) {
            fetchJob()
        }
    }, [id, supabase, router])

    // Hàm xử lý khi nhập liệu
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Hàm xử lý khi chọn Select
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Hàm Submit Form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSaving(true)

        // Kiểm tra dữ liệu bắt buộc
        if (!formData.title || !formData.company || !formData.location) {
            toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc (*)')
            setIsSaving(false)
            return
        }

        try {
            const { error } = await supabase
                .from('jobs')
                .update({
                    title: formData.title,
                    company: formData.company,
                    location: formData.location,
                    salary_range: formData.salary_range,
                    job_type: formData.job_type,
                    status: formData.status,
                    description: formData.description,
                    requirements: formData.requirements,
                })
                .eq('id', id)

            if (error) throw error

            toast.success('Cập nhật tin tuyển dụng thành công!')
            router.push('/admin/jobs')

        } catch (error: any) {
            console.error('Error updating job:', error)
            toast.error('Có lỗi xảy ra: ' + error.message)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/jobs">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa tin tuyển dụng</h1>
                    <p className="text-gray-500 text-sm">Cập nhật thông tin chi tiết về vị trí này.</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl border shadow-sm">

                {/* Nhóm thông tin cơ bản */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Chức danh công việc <span className="text-red-500">*</span></Label>
                        <Input
                            id="title"
                            name="title"
                            placeholder="VD: Senior React Developer"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="company">Tên công ty <span className="text-red-500">*</span></Label>
                        <Input
                            id="company"
                            name="company"
                            placeholder="VD: Tech Corp Solutions"
                            value={formData.company}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Địa điểm làm việc <span className="text-red-500">*</span></Label>
                        <Input
                            id="location"
                            name="location"
                            placeholder="VD: Hà Nội (Hybrid)"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="salary_range">Mức lương</Label>
                        <Input
                            id="salary_range"
                            name="salary_range"
                            placeholder="VD: 15 - 25 Triệu"
                            value={formData.salary_range}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="job_type">Loại hình công việc</Label>
                        <Select
                            value={formData.job_type}
                            onValueChange={(value) => handleSelectChange('job_type', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn loại hình" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Full-time">Full-time</SelectItem>
                                <SelectItem value="Part-time">Part-time</SelectItem>
                                <SelectItem value="Internship">Internship (Thực tập)</SelectItem>
                                <SelectItem value="Freelance">Freelance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">Trạng thái bài đăng</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleSelectChange('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Công khai (Active)</SelectItem>
                                <SelectItem value="draft">Lưu nháp (Draft)</SelectItem>
                                <SelectItem value="closed">Đóng tuyển (Closed)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Nhóm mô tả chi tiết */}
                <div className="space-y-2">
                    <Label htmlFor="description">Mô tả công việc</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Mô tả chi tiết về trách nhiệm, công việc hàng ngày..."
                        className="min-h-[150px]"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="requirements">Yêu cầu ứng viên</Label>
                    <Textarea
                        id="requirements"
                        name="requirements"
                        placeholder="Kỹ năng chuyên môn, kinh nghiệm, bằng cấp..."
                        className="min-h-[150px]"
                        value={formData.requirements}
                        onChange={handleChange}
                    />
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" asChild>
                        <Link href="/admin/jobs">Hủy bỏ</Link>
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 min-w-[120px]" disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Lưu thay đổi
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}
