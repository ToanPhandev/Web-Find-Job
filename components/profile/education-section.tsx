'use client'

import React from 'react'
import { GraduationCap, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Education {
    school: string
    major: string
    startDate: string
    endDate: string
}

interface EducationSectionProps {
    educationList: Education[]
    onChange: (list: Education[]) => void
    isEditing: boolean
}

export default function EducationSection({ educationList, onChange, isEditing }: EducationSectionProps) {
    const handleAdd = () => {
        onChange([...educationList, { school: '', major: '', startDate: '', endDate: '' }])
    }

    const handleRemove = (index: number) => {
        const newList = [...educationList]
        newList.splice(index, 1)
        onChange(newList)
    }

    const handleChange = (index: number, field: keyof Education, value: string) => {
        const newList = [...educationList]
        newList[index] = { ...newList[index], [field]: value }
        onChange(newList)
    }

    return (
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <span className="p-2 bg-green-100 rounded-lg text-green-600">
                    <GraduationCap className="size-5" />
                </span>
                Học vấn
            </h2>

            <div className={`space-y-6 ${!isEditing && 'border-l-2 border-border ml-3 pl-8 pb-2'}`}>
                {educationList.map((edu, index) => (
                    <div key={index} className={`relative ${!isEditing ? '' : 'p-4 border border-border rounded-lg bg-muted'}`}>
                        {!isEditing && (
                            <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-4 border-white bg-primary shadow-sm" />
                        )}

                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <h4 className="text-sm font-medium text-muted-foreground">Mục #{index + 1}</h4>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(index)} className="text-destructive hover:text-red-700 h-8 w-8">
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Tên trường (VD: ĐH Bách Khoa)"
                                        value={edu.school}
                                        onChange={(e) => handleChange(index, 'school', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Chuyên ngành"
                                        value={edu.major}
                                        onChange={(e) => handleChange(index, 'major', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Năm bắt đầu"
                                        value={edu.startDate}
                                        onChange={(e) => handleChange(index, 'startDate', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Năm kết thúc (hoặc hiện tại)"
                                        value={edu.endDate}
                                        onChange={(e) => handleChange(index, 'endDate', e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">{edu.school || 'Chưa nhập tên trường'}</h3>
                                <p className="text-primary font-medium">{edu.major || 'Chưa nhập chuyên ngành'}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {edu.startDate} - {edu.endDate}
                                </p>
                            </div>
                        )}
                    </div>
                ))}

                {educationList.length === 0 && !isEditing && (
                    <p className="text-muted-foreground italic">Chưa có thông tin học vấn.</p>
                )}

                {isEditing && (
                    <Button variant="outline" onClick={handleAdd} className="w-full border-dashed border-2 hover:bg-muted">
                        <Plus className="size-4 mr-2" /> Thêm học vấn
                    </Button>
                )}
            </div>
        </div>
    )
}
