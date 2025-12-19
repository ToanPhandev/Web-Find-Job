'use client'

import React, { useEffect, useState } from 'react'
import {
    Briefcase,
    Download,
    Edit2,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Loader2,
    Save,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
// Đã xóa import use-toast bị lỗi
import CVUpload from '@/components/cv_upload'

export default function ProfilePage() {
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [userEmail, setUserEmail] = useState('')

    // State cho dữ liệu Profile
    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        address: '',
        university: '',
        bio: '',
        avatar_url: ''
    })

    // 1. Fetch Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) return

                setUserEmail(user.email || '')

                // Lấy profile từ bảng profiles
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error) {
                    // Nếu lỗi là "Không tìm thấy dòng nào" (PGRST116) -> User cũ chưa có profile
                    // Thì bỏ qua lỗi này, để form trống cho người dùng nhập
                    if (error.code !== 'PGRST116') {
                        throw error
                    }
                }

                if (data) {
                    setProfile({
                        full_name: data.full_name || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        university: data.university || '',
                        bio: data.bio || '',
                        avatar_url: data.avatar_url || ''
                    })
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [supabase])

    // 2. Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    // 3. Save Data (Dùng upsert để User cũ vẫn lưu được)
    const handleSave = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            const updates = {
                id: user.id, // Bắt buộc có ID để upsert biết dòng nào
                ...profile,
                updated_at: new Date().toISOString(),
            }

            // Dùng upsert: Có rồi thì update, chưa có thì insert
            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) throw error

            setIsEditing(false)
            // Hiển thị thông báo bằng alert mặc định
            alert("Cập nhật hồ sơ thành công!")

        } catch (error) {
            console.error('Error updating profile:', error)
            alert("Có lỗi xảy ra khi lưu hồ sơ.")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-blue-50">
                        <AvatarImage src={profile.avatar_url} alt="User Avatar" />
                        <AvatarFallback className="text-3xl sm:text-4xl font-bold bg-blue-600 text-white">
                            {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 text-center sm:text-left space-y-2 w-full">
                        {isEditing ? (
                            <div className="grid gap-4 max-w-md">
                                <Input
                                    name="full_name"
                                    value={profile.full_name}
                                    onChange={handleChange}
                                    placeholder="Họ và tên"
                                    className="text-lg font-bold"
                                />
                                <Input
                                    name="university"
                                    value={profile.university}
                                    onChange={handleChange}
                                    placeholder="Trường Đại học / Chuyên ngành"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {profile.full_name || 'Chưa cập nhật tên'}
                                </h1>
                                <p className="text-blue-600 font-medium text-lg">
                                    {profile.university || 'Sinh viên CNTT (Software Engineering)'}
                                </p>
                            </>
                        )}

                        <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6 text-gray-600 mt-4">
                            <div className="flex items-center gap-2 text-sm">
                                <Mail className="size-4" />
                                <span>{userEmail}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Phone className="size-4" />
                                {isEditing ? (
                                    <Input
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        placeholder="Số điện thoại"
                                        className="h-8 w-40"
                                    />
                                ) : (
                                    <span>{profile.phone || 'SĐT: --'}</span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="size-4" />
                                {isEditing ? (
                                    <Input
                                        name="address"
                                        value={profile.address}
                                        onChange={handleChange}
                                        placeholder="Địa chỉ"
                                        className="h-8 w-40"
                                    />
                                ) : (
                                    <span>{profile.address || 'Địa chỉ: --'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 sm:mt-0 flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving}>
                                    <X className="size-4 mr-2" /> Hủy
                                </Button>
                                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                    {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                                    Lưu
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                                <Edit2 className="size-4 mr-2" />
                                Chỉnh sửa
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Main Content) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About Me */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                <FileText className="size-5" />
                            </span>
                            Giới thiệu
                        </h2>
                        {isEditing ? (
                            <Textarea
                                name="bio"
                                value={profile.bio}
                                onChange={handleChange}
                                placeholder="Viết vài dòng giới thiệu về bản thân, mục tiêu nghề nghiệp..."
                                rows={5}
                            />
                        ) : (
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {profile.bio || 'Chưa có thông tin giới thiệu. Hãy bấm chỉnh sửa để cập nhật hồ sơ của bạn ấn tượng hơn với nhà tuyển dụng.'}
                            </p>
                        )}
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="p-2 bg-green-100 rounded-lg text-green-600">
                                <GraduationCap className="size-5" />
                            </span>
                            Học vấn
                        </h2>
                        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pl-8 pb-2">
                            <div className="relative">
                                <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow-sm" />
                                <h3 className="text-lg font-semibold text-gray-900">{profile.university || 'Trường Đại học...'}</h3>
                                <p className="text-blue-600 font-medium">Chuyên ngành chính</p>
                                <p className="text-sm text-gray-500 mt-1">2021 - 2025 (Dự kiến)</p>
                            </div>
                        </div>
                    </div>

                    {/* Projects (Tĩnh - Chưa chỉnh sửa được) */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                <Briefcase className="size-5" />
                            </span>
                            Dự án nổi bật
                        </h2>
                        <div className="space-y-4">
                            <div className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900 text-lg">Hệ thống Tìm Việc Làm (Job Board)</h3>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">Đang phát triển</Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-3">
                                    Xây dựng nền tảng kết nối sinh viên và nhà tuyển dụng với Next.js 15 và Supabase.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    {/* CV/Resume Upload */}
                    <CVUpload />

                    {/* Skills */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-4">Kỹ năng</h2>
                        <div className="flex flex-wrap gap-2">
                            {['React', 'Next.js', 'TypeScript', 'Tailwind CSS'].map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-700">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}