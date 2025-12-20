'use client'

import React, { useEffect, useState } from 'react'
import {
    Briefcase,
    Edit2,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Loader2,
    Save,
    X,
    Plus,
    Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import CVUpload from '@/components/cv_upload'

// Định nghĩa kiểu dữ liệu cho Education và Project
interface EducationItem {
    school: string;
    major: string;
    years: string;
}

interface ProjectItem {
    name: string;
    desc: string;
}

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
        university: '', // Trường chính hiển thị ở Header
        bio: '',
        avatar_url: '',
        skills: [] as string[], // Mảng các kỹ năng
        education: [] as EducationItem[], // Mảng JSON học vấn
        projects: [] as ProjectItem[] // Mảng JSON dự án
    })

    // State tạm dùng để nhập skills dạng chuỗi (vd: "React, Node")
    const [skillsInput, setSkillsInput] = useState('')

    // 1. Fetch Data
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true)
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) return

                setUserEmail(user.email || '')

                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (error && error.code !== 'PGRST116') {
                    throw error
                }

                if (data) {
                    setProfile({
                        full_name: data.full_name || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        university: data.university || '',
                        bio: data.bio || '',
                        avatar_url: data.avatar_url || '',
                        skills: data.skills || [],
                        education: Array.isArray(data.education) ? data.education : [],
                        projects: Array.isArray(data.projects) ? data.projects : []
                    })
                    // Chuyển mảng skills thành chuỗi để hiển thị trong ô input khi edit
                    setSkillsInput((data.skills || []).join(', '))
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [supabase])

    // 2. Handle Basic Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    // --- Xử lý Logic Array (Education/Projects) ---

    // Thay đổi nội dung trong mảng Education
    const handleEducationChange = (index: number, field: keyof EducationItem, value: string) => {
        const newEdu = [...profile.education]
        newEdu[index][field] = value
        setProfile(prev => ({ ...prev, education: newEdu }))
    }
    // Thêm trường học mới
    const addEducation = () => {
        setProfile(prev => ({
            ...prev,
            education: [...prev.education, { school: '', major: '', years: '' }]
        }))
    }
    // Xóa trường học
    const removeEducation = (index: number) => {
        const newEdu = profile.education.filter((_, i) => i !== index)
        setProfile(prev => ({ ...prev, education: newEdu }))
    }

    // Tương tự cho Projects
    const handleProjectChange = (index: number, field: keyof ProjectItem, value: string) => {
        const newProj = [...profile.projects]
        newProj[index][field] = value
        setProfile(prev => ({ ...prev, projects: newProj }))
    }
    const addProject = () => {
        setProfile(prev => ({
            ...prev,
            projects: [...prev.projects, { name: '', desc: '' }]
        }))
    }
    const removeProject = (index: number) => {
        const newProj = profile.projects.filter((_, i) => i !== index)
        setProfile(prev => ({ ...prev, projects: newProj }))
    }

    // 3. Save Data
    const handleSave = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            // Xử lý skills từ chuỗi input -> mảng
            const skillArray = skillsInput
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)

            const updates = {
                id: user.id,
                ...profile,
                skills: skillArray,
                updated_at: new Date().toISOString(),
            }

            const { error } = await supabase.from('profiles').upsert(updates)

            if (error) throw error

            setProfile(prev => ({ ...prev, skills: skillArray }))
            setIsEditing(false)
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
        <div className="max-w-6xl mx-auto space-y-6 pb-10">
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
                            <div className="grid gap-3 max-w-md">
                                <Input
                                    name="full_name"
                                    value={profile.full_name}
                                    onChange={handleChange}
                                    placeholder="Họ và tên"
                                    className="font-bold"
                                />
                                <Input
                                    name="university"
                                    value={profile.university}
                                    onChange={handleChange}
                                    placeholder="Tiêu đề chính (VD: Sinh viên CNTT...)"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                    {profile.full_name || 'Chưa cập nhật tên'}
                                </h1>
                                <p className="text-blue-600 font-medium text-lg">
                                    {profile.university || 'Chức danh / Chuyên ngành...'}
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
                                placeholder="Viết vài dòng giới thiệu về bản thân..."
                                rows={5}
                            />
                        ) : (
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {profile.bio || 'Chưa có thông tin giới thiệu.'}
                            </p>
                        )}
                    </div>

                    {/* Education - Có tính năng lặp và thêm sửa xóa */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <GraduationCap className="size-5" />
                                </span>
                                Học vấn
                            </h2>
                            {isEditing && (
                                <Button size="sm" variant="outline" onClick={addEducation}>
                                    <Plus className="size-4 mr-1" /> Thêm
                                </Button>
                            )}
                        </div>

                        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pl-8 pb-2">
                            {profile.education.length === 0 && <p className="text-gray-400 italic">Chưa cập nhật học vấn.</p>}

                            {profile.education.map((item, index) => (
                                <div key={index} className="relative group">
                                    <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white bg-blue-600 shadow-sm" />
                                    {isEditing ? (
                                        <div className="space-y-2 p-3 border rounded-lg bg-gray-50">
                                            <div className="flex justify-between">
                                                <h4 className="text-sm font-semibold text-gray-500">Trường học #{index + 1}</h4>
                                                <button onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                            <Input
                                                placeholder="Tên trường (VD: Đại học FPT)"
                                                value={item.school}
                                                onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Chuyên ngành"
                                                value={item.major}
                                                onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Niên khóa (VD: 2021 - 2025)"
                                                value={item.years}
                                                onChange={(e) => handleEducationChange(index, 'years', e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{item.school}</h3>
                                            <p className="text-blue-600 font-medium">{item.major}</p>
                                            <p className="text-sm text-gray-500 mt-1">{item.years}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projects - Có tính năng lặp và thêm sửa xóa */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Briefcase className="size-5" />
                                </span>
                                Dự án nổi bật
                            </h2>
                            {isEditing && (
                                <Button size="sm" variant="outline" onClick={addProject}>
                                    <Plus className="size-4 mr-1" /> Thêm
                                </Button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {profile.projects.length === 0 && <p className="text-gray-400 italic">Chưa cập nhật dự án.</p>}

                            {profile.projects.map((item, index) => (
                                <div key={index} className="border border-gray-100 rounded-lg p-4 hover:border-blue-200 transition-colors">
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <h4 className="text-sm font-semibold text-gray-500">Dự án #{index + 1}</h4>
                                                <button onClick={() => removeProject(index)} className="text-red-500 hover:text-red-700">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                            <Input
                                                placeholder="Tên dự án"
                                                value={item.name}
                                                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                                                className="font-semibold"
                                            />
                                            <Textarea
                                                placeholder="Mô tả dự án, công nghệ sử dụng..."
                                                value={item.desc}
                                                onChange={(e) => handleProjectChange(index, 'desc', e.target.value)}
                                                rows={2}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {item.desc}
                                            </p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="space-y-6">
                    {/* CV Upload Component */}
                    <CVUpload />

                    {/* Skills */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="font-bold text-gray-900 mb-4">Kỹ năng</h2>
                        {isEditing ? (
                            <div className="space-y-2">
                                <Textarea
                                    value={skillsInput}
                                    onChange={(e) => setSkillsInput(e.target.value)}
                                    placeholder="Nhập kỹ năng ngăn cách bằng dấu phẩy. VD: React, Node.js, SQL"
                                />
                                <p className="text-xs text-gray-500">Ngăn cách bằng dấu phẩy</p>
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.length === 0 && <span className="text-sm text-gray-500">Chưa có kỹ năng.</span>}
                                {profile.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}