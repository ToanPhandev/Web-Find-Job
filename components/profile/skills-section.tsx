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
        <div className="bg-card text-card-foreground rounded-xl shadow-sm p-6">
            <h2 className="font-bold text-foreground mb-4 text-lg">Kỹ năng</h2>

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
                            className="p-2 bg-primary/10 text-primary rounded-md hover:bg-blue-100"
                        >
                            <Plus className="size-5" />
                        </button>
                    </div>
                )}

                <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="bg-muted text-muted-foreground text-sm py-1.5 px-3 flex items-center gap-1 group">
                            {skill}
                            {isEditing && (
                                <button
                                    onClick={() => removeSkill(skill)}
                                    className="ml-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10 p-0.5"
                                >
                                    <X className="size-3" />
                                </button>
                            )}
                        </Badge>
                    ))}

                    {skills.length === 0 && !isEditing && (
                        <p className="text-muted-foreground italic text-sm">Chưa có kỹ năng nào.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
