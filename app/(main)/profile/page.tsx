'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
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
    Trash2,
    Camera,
    Globe,
    Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'
import CVUpload from '@/components/cv_upload'
import { toast } from 'react-hot-toast'

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
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [userEmail, setUserEmail] = useState('')

    // State cho dữ liệu Profile
    const [profile, setProfile] = useState({
        full_name: '',
        phone: '',
        address: '',
        university: '',
        bio: '',
        avatar_url: '',
        portfolio_url: '',
        skills: [] as string[],
        education: [] as EducationItem[],
        projects: [] as ProjectItem[]
    })

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
                        full_name: data.full_name || user.user_metadata?.full_name || '',
                        phone: data.phone || '',
                        address: data.address || '',
                        university: data.university || '',
                        bio: data.bio || '',
                        avatar_url: data.avatar_url || '',
                        portfolio_url: data.portfolio_url || '',
                        skills: data.skills || [],
                        education: Array.isArray(data.education) ? data.education : [],
                        projects: Array.isArray(data.projects) ? data.projects : []
                    })
                    setSkillsInput((data.skills || []).join(', '))
                }
            } catch (error) {
                console.error('Error fetching profile:', error)
                toast.error('Không thể tải thông tin hồ sơ.')
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [supabase])

    // Handle Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setProfile(prev => ({ ...prev, [name]: value }))
    }

    // --- Avatar Upload Logic ---
    const handleAvatarClick = () => {
        if (!isEditing) return
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        const file = e.target.files[0]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        setUploadingAvatar(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            // Upload
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Update State (Preview immediately)
            setProfile(prev => ({ ...prev, avatar_url: publicUrl }))

            toast.success('Đã tải ảnh lên! Nhấn Lưu để cập nhật.')

        } catch (error: any) {
            console.error('Error uploading avatar:', error)
            toast.error('Lỗi khi tải ảnh lên.')
        } finally {
            setUploadingAvatar(false)
        }
    }

    // --- Array Handlers (Education/Projects) ---
    const handleEducationChange = (index: number, field: keyof EducationItem, value: string) => {
        const newEdu = [...profile.education]
        newEdu[index][field] = value
        setProfile(prev => ({ ...prev, education: newEdu }))
    }
    const addEducation = () => setProfile(prev => ({ ...prev, education: [...prev.education, { school: '', major: '', years: '' }] }))
    const removeEducation = (index: number) => setProfile(prev => ({ ...prev, education: profile.education.filter((_, i) => i !== index) }))

    const handleProjectChange = (index: number, field: keyof ProjectItem, value: string) => {
        const newProj = [...profile.projects]
        newProj[index][field] = value
        setProfile(prev => ({ ...prev, projects: newProj }))
    }
    const addProject = () => setProfile(prev => ({ ...prev, projects: [...prev.projects, { name: '', desc: '' }] }))
    const removeProject = (index: number) => setProfile(prev => ({ ...prev, projects: profile.projects.filter((_, i) => i !== index) }))

    // 3. Save Data
    const handleSave = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user')

            const skillArray = skillsInput.split(',').map(s => s.trim()).filter(s => s.length > 0)

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
            toast.success('Cập nhật hồ sơ thành công!')

        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error("Có lỗi xảy ra khi lưu hồ sơ.")
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
        // ĐÃ SỬA: Đổi 'pt-20' thành 'pt-16' (khoảng 64px)
        // Đây là chiều cao chuẩn của Header, giúp khung hồ sơ sát lên trên mà không bị che.
        // Nếu vẫn thấy hở, bạn có thể thử giảm xuống 'pt-14'
        <div className="max-w-6xl mx-auto space-y-6 pb-10 pt-3 px-4 sm:px-6">

            {/* Header / Cover Area */}
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                    {/* Avatar Section */}
                    <div className="relative group">
                        <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-md">
                            <AvatarImage src={profile.avatar_url} alt="User Avatar" className="object-cover" />
                            <AvatarFallback className="text-4xl font-bold bg-blue-600 text-white">
                                {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                        </Avatar>

                        {isEditing && (
                            <>
                                <div
                                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={handleAvatarClick}
                                >
                                    <Camera className="text-white w-8 h-8" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                />
                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                                        <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 text-center sm:text-left space-y-4 w-full pt-2">
                        {isEditing ? (
                            <div className="grid gap-4 max-w-lg">
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Họ và tên</label>
                                    <Input
                                        name="full_name"
                                        value={profile.full_name}
                                        onChange={handleChange}
                                        placeholder="Họ và tên"
                                        className="font-bold text-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-500 uppercase">Tiêu đề / Vị trí</label>
                                    <Input
                                        name="university"
                                        value={profile.university}
                                        onChange={handleChange}
                                        placeholder="VD: Sinh viên CNTT, Frontend Developer..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900">
                                        {profile.full_name || 'Chưa cập nhật tên'}
                                    </h2>
                                    <p className="text-xl text-blue-600 font-medium">
                                        {profile.university || 'Chức danh / Chuyên ngành...'}
                                    </p>
                                </div>
                            </>
                        )}

                        <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-gray-600">
                            <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <Mail className="size-4 text-gray-400" />
                                <span>{userEmail}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <Phone className="size-4 text-gray-400" />
                                {isEditing ? (
                                    <Input
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        placeholder="Số điện thoại"
                                        className="h-7 w-32 text-sm border-none bg-transparent shadow-none focus-visible:ring-0 p-0"
                                    />
                                ) : (
                                    <span>{profile.phone || 'SĐT: --'}</span>
                                )}
                            </div>

                            {/* Portfolio Link */}
                            {(isEditing || profile.portfolio_url) && (
                                <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                    <Globe className="size-4 text-gray-400" />
                                    {isEditing ? (
                                        <Input
                                            name="portfolio_url"
                                            value={profile.portfolio_url}
                                            onChange={handleChange}
                                            placeholder="Link Portfolio/Website"
                                            className="h-7 w-48 text-sm border-none bg-transparent shadow-none focus-visible:ring-0 p-0"
                                        />
                                    ) : (
                                        <a href={profile.portfolio_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline hover:text-blue-700 truncate max-w-[200px]">
                                            {profile.portfolio_url}
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <MapPin className="size-4 text-gray-400" />
                                {isEditing ? (
                                    <Input
                                        name="address"
                                        value={profile.address}
                                        onChange={handleChange}
                                        placeholder="Địa chỉ"
                                        className="h-7 w-40 text-sm border-none bg-transparent shadow-none focus-visible:ring-0 p-0"
                                    />
                                ) : (
                                    <span>{profile.address || 'Địa chỉ: --'}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Edit Actions */}
                    <div className="mt-4 sm:mt-0 flex items-center gap-3">
                        {isEditing ? (
                            <>
                                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={saving} className="border-gray-300">
                                    <X className="size-4 mr-2" /> Hủy
                                </Button>
                                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                    {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
                                    Lưu thay đổi
                                </Button>
                            </>
                        ) : (
                            <Button onClick={() => setIsEditing(true)} className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 shadow-sm">
                                <Edit2 className="size-4 mr-2" />
                                Chỉnh sửa hồ sơ
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
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                                placeholder="Viết vài dòng giới thiệu về bản thân, kinh nghiệm, mục tiêu nghề nghiệp..."
                                rows={5}
                                className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                            />
                        ) : (
                            <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {profile.bio || <span className="text-gray-400 italic">Chưa có thông tin giới thiệu.</span>}
                            </div>
                        )}
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="p-2 bg-green-100 rounded-lg text-green-600">
                                    <GraduationCap className="size-5" />
                                </span>
                                Học vấn
                            </h2>
                            {isEditing && (
                                <Button size="sm" variant="ghost" onClick={addEducation} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Plus className="size-4 mr-1" /> Thêm trường
                                </Button>
                            )}
                        </div>

                        <div className="space-y-6">
                            {profile.education.length === 0 && <p className="text-gray-400 italic text-center py-4">Chưa cập nhật học vấn.</p>}

                            {profile.education.map((item, index) => (
                                <div key={index} className="relative pl-6 border-l-2 border-gray-100 last:border-0 pb-6 last:pb-0">
                                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-100 border-2 border-green-500"></div>

                                    {isEditing ? (
                                        <div className="space-y-3 p-4 border rounded-xl bg-gray-50/50">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase">Mục #{index + 1}</h4>
                                                <button onClick={() => removeEducation(index)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <Input
                                                    placeholder="Tên trường"
                                                    value={item.school}
                                                    onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                                                    className="bg-white"
                                                />
                                                <Input
                                                    placeholder="Chuyên ngành"
                                                    value={item.major}
                                                    onChange={(e) => handleEducationChange(index, 'major', e.target.value)}
                                                    className="bg-white"
                                                />
                                                <Input
                                                    placeholder="Niên khóa (VD: 2019-2023)"
                                                    value={item.years}
                                                    onChange={(e) => handleEducationChange(index, 'years', e.target.value)}
                                                    className="bg-white sm:col-span-2"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">{item.school}</h3>
                                            <p className="text-gray-600 font-medium">{item.major}</p>
                                            <p className="text-sm text-gray-400 mt-1">{item.years}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projects */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                    <Briefcase className="size-5" />
                                </span>
                                Dự án nổi bật
                            </h2>
                            {isEditing && (
                                <Button size="sm" variant="ghost" onClick={addProject} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                    <Plus className="size-4 mr-1" /> Thêm dự án
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {profile.projects.length === 0 && <p className="text-gray-400 italic text-center py-4">Chưa cập nhật dự án.</p>}

                            {profile.projects.map((item, index) => (
                                <div key={index} className="group border border-gray-100 rounded-xl p-5 hover:border-purple-200 hover:shadow-sm transition-all bg-white">
                                    {isEditing ? (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xs font-bold text-gray-500 uppercase">Dự án #{index + 1}</h4>
                                                <button onClick={() => removeProject(index)} className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                            <Input
                                                placeholder="Tên dự án"
                                                value={item.name}
                                                onChange={(e) => handleProjectChange(index, 'name', e.target.value)}
                                                className="font-bold"
                                            />
                                            <Textarea
                                                placeholder="Mô tả chi tiết dự án, công nghệ sử dụng, vai trò..."
                                                value={item.desc}
                                                onChange={(e) => handleProjectChange(index, 'desc', e.target.value)}
                                                rows={3}
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-600 transition-colors">{item.name}</h3>
                                            <p className="text-gray-600 text-sm leading-relaxed">
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
                    <div className="space-y-6 h-fit">
                        <CVUpload />

                        {/* Skills */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="font-bold text-gray-900 mb-4 flex items-center">
                                Kỹ năng chuyên môn
                            </h2>
                            {isEditing ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={skillsInput}
                                        onChange={(e) => setSkillsInput(e.target.value)}
                                        placeholder="Nhập kỹ năng ngăn cách bằng dấu phẩy. VD: React, Node.js, SQL"
                                        className="min-h-[100px]"
                                    />
                                    <p className="text-xs text-gray-400">
                                        Mẹo: Nhập nhiều kỹ năng ngăn cách bởi dấu phẩy
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.length === 0 && <span className="text-sm text-gray-400 italic">Chưa có kỹ năng.</span>}
                                    {profile.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}