'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Upload, FileText, Loader2, Trash2, Eye, Calendar, Paperclip, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'

export interface CVFile {
    name: string
    url: string
    created_at: string
}

export default function CVUpload() {
    const supabase = createClient()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [cvList, setCvList] = useState<CVFile[]>([])

    // State to track which items are expanded (by index)
    const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set())

    // Fetch existing CVs on mount
    useEffect(() => {
        const fetchCVs = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data, error } = await supabase
                    .from('profiles')
                    .select('cvs')
                    .eq('id', user.id)
                    .single()

                if (error) throw error

                // Ensure data.cvs is an array
                if (data && Array.isArray(data.cvs)) {
                    setCvList(data.cvs)
                } else {
                    setCvList([])
                }
            } catch (error) {
                console.error('Error fetching CVs:', error)
                // Don't show toast error here to avoid annoyance on load
            } finally {
                setIsLoading(false)
            }
        }

        fetchCVs()
    }, [supabase])

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
        if (!validTypes.includes(file.type)) {
            toast.error('Vui lòng tải lên file PDF hoặc DOCX')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 5MB')
            return
        }

        try {
            setIsUploading(true)
            toast.loading('Đang tải lên CV...', { id: 'upload-cv' })

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('User not authenticated')

            const fileExt = file.name.split('.').pop()
            // Create a unique filename but try to keep original name part for reference if needed
            const fileName = `cv-${user.id}-${Date.now()}.${fileExt}`
            const filePath = `${fileName}`

            // Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: publicUrlData } = supabase.storage
                .from('resumes')
                .getPublicUrl(filePath)

            const publicUrl = publicUrlData.publicUrl

            // Create new CV object
            const newCV: CVFile = {
                name: file.name,
                url: publicUrl,
                created_at: new Date().toISOString()
            }

            // Update local state
            const updatedList = [...cvList, newCV]
            setCvList(updatedList)

            // Update Database
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ cvs: updatedList })
                .eq('id', user.id)

            if (updateError) throw updateError

            toast.success('Tải lên CV thành công!', { id: 'upload-cv' })

        } catch (error: any) {
            console.error('Error uploading CV:', error)
            toast.error('Có lỗi xảy ra khi tải lên CV', { id: 'upload-cv' })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleDelete = async (index: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa CV này không?')) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const updatedList = cvList.filter((_, i) => i !== index)
            setCvList(updatedList)

            // Also remove from expandedIndices if necessary, though index shift handles naturally for simple usage
            // Ideally we'd map by ID, but index is simple enough for this scope

            const { error } = await supabase
                .from('profiles')
                .update({ cvs: updatedList })
                .eq('id', user.id)

            if (error) {
                // Revert state if DB update fails
                setCvList(cvList)
                throw error
            }

            toast.success('Đã xóa CV thành công')

        } catch (error) {
            console.error('Error deleting CV:', error)
            toast.error('Không thể xóa CV')
        }
    }

    const triggerFileInput = () => {
        fileInputRef.current?.click()
    }

    // Toggle expand/collapse for a single item
    const toggleExpand = (index: number) => {
        setExpandedIndices(prev => {
            const newSet = new Set(prev)
            if (newSet.has(index)) {
                newSet.delete(index)
            } else {
                newSet.add(index)
            }
            return newSet
        })
    }

    // Toggle expand/collapse for all items
    const toggleExpandAll = () => {
        if (expandedIndices.size === cvList.length && cvList.length > 0) {
            // Collapse all
            setExpandedIndices(new Set())
        } else {
            // Expand all
            const allIndices = new Set(cvList.map((_, i) => i))
            setExpandedIndices(allIndices)
        }
    }

    const isAllExpanded = cvList.length > 0 && expandedIndices.size === cvList.length

    if (isLoading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        )
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Paperclip className="size-5 text-gray-500" />
                    Danh sách CV
                </h3>
                {cvList.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleExpandAll}
                        className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                    >
                        {isAllExpanded ? (
                            <>
                                <ChevronsUp className="h-3 w-3 mr-1" /> Thu gọn
                            </>
                        ) : (
                            <>
                                <ChevronsDown className="h-3 w-3 mr-1" /> Mở rộng
                            </>
                        )}
                    </Button>
                )}
            </div>

            {/* List of uploaded CVs */}
            <div className="space-y-3">
                {cvList.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Chưa có CV nào được tải lên.</p>
                ) : (
                    cvList.map((cv, index) => {
                        const isExpanded = expandedIndices.has(index)

                        return (
                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex items-start space-x-3 overflow-hidden flex-1">
                                    <div className="bg-blue-50 p-2 rounded-lg mt-0.5">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-1">
                                            <p
                                                className={`text-sm font-medium text-gray-900 transition-all cursor-pointer ${isExpanded ? 'break-all whitespace-normal' : 'truncate'
                                                    }`}
                                                onClick={() => toggleExpand(index)}
                                                title={cv.name}
                                            >
                                                {cv.name}
                                            </p>
                                            <button
                                                onClick={() => toggleExpand(index)}
                                                className="text-gray-400 hover:text-blue-600 p-0.5 rounded-sm transition-colors mt-0.5 shrink-0"
                                            >
                                                {isExpanded ? (
                                                    <ChevronUp className="h-3 w-3" />
                                                ) : (
                                                    <ChevronDown className="h-3 w-3" />
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 flex items-center mt-1">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {format(new Date(cv.created_at), 'dd/MM/yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-1 shrink-0 ml-2">
                                    <a
                                        href={cv.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                        title="Xem CV"
                                    >
                                        <Eye className="h-4 w-4" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(index)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                        title="Xóa"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Upload Dropzone */}
            <div className="pt-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                />

                <div
                    onClick={triggerFileInput}
                    className={`
                        border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors
                        ${isUploading ? 'bg-gray-50 border-gray-300' : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'}
                    `}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
                            <p className="text-sm text-gray-500 text-center">Đang tải lên...</p>
                        </>
                    ) : (
                        <>
                            <div className="bg-blue-100 p-3 rounded-full mb-3">
                                <Upload className="h-6 w-6 text-blue-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 text-center mb-1">
                                Tải lên CV mới
                            </p>
                            <p className="text-xs text-gray-500 text-center">
                                Hỗ trợ PDF, DOCX (Max 5MB)
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
