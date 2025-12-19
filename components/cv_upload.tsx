'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Upload, FileText, CheckCircle, AlertCircle, Eye, Trash2, Maximize2, Minimize2 } from 'lucide-react'

interface CVFile {
    id: string
    name: string
    url: string
    created_at: string
}

export default function CVUpload() {
    const supabase = createClient()

    // States
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [cvList, setCvList] = useState<CVFile[]>([])
    const [fetching, setFetching] = useState(true)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    // State for tracking expanded filenames
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    const toggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    // Check if all are expanded
    const areAllExpanded = cvList.length > 0 && expandedIds.size === cvList.length

    const toggleAll = () => {
        if (areAllExpanded) {
            setExpandedIds(new Set())
        } else {
            setExpandedIds(new Set(cvList.map(cv => cv.id)))
        }
    }

    // 1. Fetch List of CVs
    const fetchCVs = useCallback(async () => {
        try {
            setFetching(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // List files in user's folder
            const { data, error } = await supabase.storage
                .from('resumes')
                .list(user.id + '/', {
                    limit: 10,
                    offset: 0,
                    sortBy: { column: 'created_at', order: 'desc' },
                })

            if (error) throw error

            if (data) {
                // Map storage files to usable objects
                const files = data.map((file) => {
                    const filePath = `${user.id}/${file.name}`
                    const { data: { publicUrl } } = supabase.storage
                        .from('resumes')
                        .getPublicUrl(filePath)

                    return {
                        id: file.id,
                        name: file.name,
                        url: publicUrl,
                        created_at: file.created_at,
                    }
                })
                setCvList(files)
            }
        } catch (error) {
            console.error('Error fetching CVs:', error)
        } finally {
            setFetching(false)
        }
    }, [supabase])

    useEffect(() => {
        fetchCVs()
    }, [fetchCVs])

    // 2. Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (!selectedFile) return

        // Validate PDF
        if (selectedFile.type !== 'application/pdf') {
            setMessage({ type: 'error', text: 'Vui lòng chỉ chọn file định dạng .pdf' })
            setFile(null)
            return
        }

        // Validate Size (Optional, e.g., 5MB)
        if (selectedFile.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'File không được quá 5MB' })
            setFile(null)
            return
        }

        setFile(selectedFile)
        setMessage(null)
    }

    // 3. Upload Logic
    const handleUpload = async () => {
        if (!file) return

        setLoading(true)
        setMessage(null)

        try {
            // A. Get User
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError || !user) throw new Error("Bạn cần đăng nhập để tải lên CV.")

            // B. Prepare Filename: user_id/timestamp_filename.pdf
            const timestamp = Date.now()
            // Sanitize filename to remove special chars
            const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            const filePath = `${user.id}/${timestamp}_${safeName}`

            // C. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false // Prevent valid overwrites if logic fails, usually we want unique paths
                })

            if (uploadError) throw uploadError

            // Note: We still update the 'profiles' table with the LATEST CV for other parts of the app to use
            // D. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath)

            // E. Update Profile
            await supabase.from('profiles').update({
                cv_url: publicUrl,
                cv_name: file.name
            }).eq('id', user.id)

            // Success Update
            setMessage({ type: 'success', text: 'Tải lên CV thành công!' })
            setFile(null)

            // Refresh list
            fetchCVs()

            // Reset input value manually if needed, or rely on key prop
        } catch (error: any) {
            console.error('CV Upload Error:', error)
            setMessage({ type: 'error', text: error.message || 'Đã có lỗi xảy ra khi tải lên.' })
        } finally {
            setLoading(false)
        }
    }

    // 4. Delete Logic
    const handleDelete = async (fileName: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa CV này không?")) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const filePath = `${user.id}/${fileName}`

            const { error } = await supabase.storage
                .from('resumes')
                .remove([filePath])

            if (error) throw error

            // Update UI optimistically or refetch
            setCvList(prev => prev.filter(cv => cv.name !== fileName))
            setMessage({ type: 'success', text: 'Đã xóa CV thành công.' })

        } catch (error: any) {
            console.error('Delete Error:', error)
            setMessage({ type: 'error', text: 'Không thể xóa file này.' })
        }
    }

    return (
        <div className="w-full max-w-md p-6 bg-white rounded-xl border border-gray-100 shadow-sm space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FileText className="size-5 text-blue-600" />
                    Quản lý CV
                </h3>
                <div className="flex flex-col items-start">
                    <p className="text-sm text-gray-500 mt-1">
                        Danh sách các hồ sơ bạn đã tải lên.
                    </p>
                    {cvList.length > 0 && (
                        <button
                            onClick={toggleAll}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                            title={areAllExpanded ? "Thu gọn toàn bộ" : "Hiển thị toàn bộ tên file"}
                        >
                            {areAllExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                            {areAllExpanded ? "Thu gọn" : "Mở rộng tên"}
                        </button>
                    )}
                </div>
            </div>

            {/* List of CVs */}
            <div className="space-y-3">
                {fetching ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                ) : cvList.length > 0 ? (
                    cvList.map((cv) => (
                        <div key={cv.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg group hover:border-blue-200 transition-colors">
                            <div className="flex items-start gap-3 overflow-hidden flex-1">
                                <FileText className="size-4 text-blue-600 shrink-0 mt-1" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start gap-1">
                                        <p
                                            className={`text-sm font-medium text-gray-900 transition-all duration-200 ${expandedIds.has(cv.id)
                                                ? 'whitespace-normal break-all'
                                                : 'truncate max-w-[140px]'
                                                }`}
                                            title={cv.name}
                                        >
                                            {cv.name.split('_').slice(1).join('_') || cv.name}
                                        </p>
                                        <button
                                            onClick={() => toggleExpand(cv.id)}
                                            className="text-gray-400 hover:text-blue-600 p-0.5 shrink-0"
                                            title={expandedIds.has(cv.id) ? "Thu gọn tên" : "Xem toàn bộ tên"}
                                        >
                                            {expandedIds.has(cv.id) ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path d="M21 8h-3a2 2 0 0 1-2-2V3" /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path d="M16 21v-3a2 2 0 0 1 2-2h3" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" /></svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {new Date(cv.created_at).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon-sm" asChild className="text-gray-500 hover:text-blue-600 h-8 w-8">
                                    <a href={cv.url} target="_blank" rel="noopener noreferrer" title="Xem">
                                        <Eye className="size-4" />
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => handleDelete(cv.name)}
                                    className="text-gray-500 hover:text-red-600 h-8 w-8"
                                    title="Xóa"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-400">Chưa có CV nào được tải lên.</p>
                    </div>
                )}
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-3 rounded-lg flex items-start gap-2 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="size-4 mt-0.5 shrink-0" />
                    ) : (
                        <AlertCircle className="size-4 mt-0.5 shrink-0" />
                    )}
                    <span>{message.text}</span>
                </div>
            )}

            {/* Upload Area */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="group w-full">
                    <label
                        htmlFor="cv-upload-input"
                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${file ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white'}`}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 w-full">
                            <Upload className={`w-8 h-8 mb-3 ${file ? 'text-blue-500' : 'text-gray-400'}`} />
                            {file ? (
                                <div className="flex flex-col items-center gap-2 max-w-full">
                                    <p className="text-sm font-medium text-blue-600 truncate max-w-[200px]" title={file.name}>
                                        {file.name}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setFile(null)
                                        }}
                                        className="p-2 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors shadow-sm border border-red-100"
                                        title="Hủy chọn file"
                                    >
                                        <Trash2 className="size-5" />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    <span className="font-semibold text-blue-600">Hãy nhấp vào đây</span> để tải File lên
                                    <br />
                                    <span className="text-xs text-gray-400">(Không vượt quá 5MB)</span>
                                </p>
                            )}
                        </div>
                        <Input
                            id="cv-upload-input"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={loading}
                        />
                    </label>
                </div>

                <Button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang tải lên...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            Tải lên CV mới
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}
