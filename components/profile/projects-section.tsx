'use client'

import React from 'react'
import { Briefcase, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Project {
    name: string
    description: string
    role: string
}

interface ProjectsSectionProps {
    projectList: Project[]
    onChange: (list: Project[]) => void
    isEditing: boolean
}

export default function ProjectsSection({ projectList, onChange, isEditing }: ProjectsSectionProps) {
    const handleAdd = () => {
        onChange([...projectList, { name: '', description: '', role: '' }])
    }

    const handleRemove = (index: number) => {
        const newList = [...projectList]
        newList.splice(index, 1)
        onChange(newList)
    }

    const handleChange = (index: number, field: keyof Project, value: string) => {
        const newList = [...projectList]
        newList[index] = { ...newList[index], [field]: value }
        onChange(newList)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <Briefcase className="size-5" />
                </span>
                Dự án nổi bật
            </h2>

            <div className="space-y-4">
                {projectList.map((project, index) => (
                    <div key={index} className={`rounded-lg ${isEditing ? 'p-4 border border-gray-100 bg-gray-50' : 'border border-gray-100 p-4 hover:border-blue-200 transition-colors'}`}>
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-medium text-gray-500">Dự án #{index + 1}</h4>
                                    <Button variant="ghost" size="icon-sm" onClick={() => handleRemove(index)} className="text-red-500 hover:text-red-700 h-8 w-8">
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                                <Input
                                    placeholder="Tên dự án"
                                    value={project.name}
                                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                                    className="font-medium"
                                />
                                <Input
                                    placeholder="Vai trò của bạn (VD: Frontend, Fullstack)"
                                    value={project.role}
                                    onChange={(e) => handleChange(index, 'role', e.target.value)}
                                />
                                <Textarea
                                    placeholder="Mô tả ngắn gọn về dự án..."
                                    value={project.description}
                                    onChange={(e) => handleChange(index, 'description', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-gray-900 text-lg">{project.name || 'Dự án chưa đặt tên'}</h3>
                                    {project.role && (
                                        <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">
                                            {project.role}
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                                    {project.description || 'Chưa có mô tả.'}
                                </p>
                            </>
                        )}
                    </div>
                ))}

                {projectList.length === 0 && !isEditing && (
                    <p className="text-gray-500 italic">Chưa có dự án nào.</p>
                )}

                {isEditing && (
                    <Button variant="outline" onClick={handleAdd} className="w-full border-dashed border-2 hover:bg-gray-50">
                        <Plus className="size-4 mr-2" /> Thêm dự án
                    </Button>
                )}
            </div>
        </div>
    )
}
