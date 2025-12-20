'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'

interface SkillsSectionProps {
    skills: string[]
    onChange: (skills: string[]) => void
    isEditing: boolean
}

export default function SkillsSection({ skills, onChange, isEditing }: SkillsSectionProps) {
    const [inputValue, setInputValue] = useState('')

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            addSkill()
        }
    }

    const addSkill = () => {
        const trimmed = inputValue.trim().replace(/^,|,$/g, '')
        if (trimmed && !skills.includes(trimmed)) {
            onChange([...skills, trimmed])
            setInputValue('')
        }
    }

    const removeSkill = (skillToRemove: string) => {
        onChange(skills.filter(skill => skill !== skillToRemove))
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4 text-lg">Kỹ năng</h2>

            <div className="space-y-4">
                {isEditing && (
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nhập kỹ năng rồi nhấn Enter..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={addSkill}
                            className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
                        >
                            <Plus className="size-5" />
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-gray-100 text-gray-700 text-sm py-1.5 px-3 flex items-center gap-1 group">
                            {skill}
                            {isEditing && (
                                <button
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 p-0.5"
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </Badge>
                    ))}

                    {skills.length === 0 && !isEditing && (
                        <p className="text-gray-500 italic text-sm">Chưa có kỹ năng nào.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
