'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Loader2, FileText, Upload, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'react-hot-toast';

interface CVFile {
    id: string;
    name: string;
    created_at: string;
    url: string;
}

export default function JobApplicationPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const supabase = createClient();

    // Form States
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [cvMethod, setCvMethod] = useState<'existing' | 'upload'>('upload');
    const [selectedCv, setSelectedCv] = useState<string>(''); // ID if existing
    const [selectedCvUrl, setSelectedCvUrl] = useState<string>(''); // URL if existing
    const [cvFile, setCvFile] = useState<File | null>(null);

    // UI States
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [existingCVs, setExistingCVs] = useState<CVFile[]>([]);

    // 1. Fetch User Profile & CVs
    useEffect(() => {
        const initData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    setIsLoading(false);
                    return; // Or redirect to login
                }

                setEmail(user.email || '');

                // A. Get Profile Info
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, phone')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setFullname(profile.full_name || '');
                    setPhone(profile.phone || '');
                }

                // B. Get Existing CVs
                const { data: files } = await supabase.storage
                    .from('resumes')
                    .list(user.id + '/', {
                        limit: 5,
                        offset: 0,
                        sortBy: { column: 'created_at', order: 'desc' },
                    });

                if (files && files.length > 0) {
                    const mappedFiles = files.map(f => {
                        const filePath = `${user.id}/${f.name}`;
                        const { data: { publicUrl } } = supabase.storage
                            .from('resumes')
                            .getPublicUrl(filePath);
                        return {
                            id: f.id,
                            name: f.name,
                            created_at: f.created_at,
                            url: publicUrl
                        };
                    });
                    setExistingCVs(mappedFiles);
                    setCvMethod('existing'); // Default to existing if available
                    setSelectedCv(mappedFiles[0].id); // Auto-select latest
                    setSelectedCvUrl(mappedFiles[0].url);
                }

            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initData();
    }, [supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalCvUrl = '';

        if (cvMethod === 'upload') {
            if (!cvFile) {
                toast.error('Vui lòng chọn file CV!');
                return;
            }
        } else {
            if (!selectedCv) {
                toast.error('Vui lòng chọn một CV có sẵn!');
                return;
            }
            finalCvUrl = selectedCvUrl;
        }

        setIsSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Bạn cần đăng nhập để ứng tuyển.");

            // 1. Handle Upload if needed
            if (cvMethod === 'upload' && cvFile) {
                const fileName = `${user.id}/${Date.now()}_${cvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                const { error: uploadError } = await supabase.storage
                    .from('resumes')
                    .upload(fileName, cvFile);

                if (uploadError) throw new Error(`Lỗi upload CV: ${uploadError.message}`);

                const { data: { publicUrl } } = supabase.storage
                    .from('resumes')
                    .getPublicUrl(fileName);

                finalCvUrl = publicUrl;

                // Optional: Save to profiles table as latest CV
                await supabase.from('profiles').update({
                    cv_url: publicUrl,
                    cv_name: cvFile.name
                }).eq('id', user.id);
            }

            // 2. Submit Application
            const { error: insertError } = await supabase
                .from('applications')
                .insert([
                    {
                        job_id: Number(id),
                        user_id: user.id, // Explicitly linking user
                        fullname,
                        email,
                        phone,
                        cover_letter: coverLetter,
                        cv_url: finalCvUrl,
                        status: 'pending',
                    },
                ]);

            if (insertError) throw new Error(`Lỗi lưu đơn ứng tuyển: ${insertError.message}`);

            toast.success('Nộp hồ sơ thành công!');
            router.push('/');
        } catch (error: any) {
            console.error('Submission error:', error);
            toast.error(error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-gray-500">Đang chuẩn bị hồ sơ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Toaster position="top-center" />
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 py-6 px-8">
                        <h1 className="text-2xl font-bold text-white">
                            Ứng tuyển nhanh (Easy Apply)
                        </h1>
                        <p className="text-blue-100 mt-1">
                            Thông tin của bạn đã được điền tự động. Vui lòng kiểm tra lại.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="py-8 px-8 space-y-6">
                        {/* Auto-filled Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="col-span-full mb-2">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Thông tin cá nhân</h3>
                            </div>

                            <div>
                                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                                    Họ và tên <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="fullname"
                                    required
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0901234567"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-100 cursor-not-allowed"
                                    placeholder="example@email.com"
                                    readOnly // Usually email shouldn't change for the same user account context easily
                                />
                            </div>
                        </div>

                        {/* CV Selection Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Chọn CV ứng tuyển <span className="text-red-500">*</span>
                            </label>

                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setCvMethod('existing')}
                                    disabled={existingCVs.length === 0}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors border ${cvMethod === 'existing'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        } ${existingCVs.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Chọn từ thư viện ({existingCVs.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCvMethod('upload')}
                                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors border ${cvMethod === 'upload'
                                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    Tải lên CV mới
                                </button>
                            </div>

                            {/* Option A: Select Existing */}
                            {cvMethod === 'existing' && (
                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                    {existingCVs.map((cv) => (
                                        <div
                                            key={cv.id}
                                            onClick={() => {
                                                setSelectedCv(cv.id);
                                                setSelectedCvUrl(cv.url);
                                            }}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${selectedCv === cv.id
                                                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                : 'border-gray-200 hover:border-blue-300'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${selectedCv === cv.id ? 'border-blue-600' : 'border-gray-300'
                                                }`}>
                                                {selectedCv === cv.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-sm font-medium text-gray-900 truncate" title={cv.name}>
                                                    {cv.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Đã tải lên: {new Date(cv.created_at).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <a
                                                href={cv.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-blue-600 ml-2"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <FileText className="size-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Option B: Upload New */}
                            {cvMethod === 'upload' && (
                                <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors duration-200 ${isSubmitting ? 'bg-gray-100 border-gray-300 cursor-not-allowed' : 'border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 cursor-pointer'} relative`}>
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label
                                                htmlFor="cv-upload"
                                                className={`relative rounded-md font-medium text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${isSubmitting ? 'cursor-not-allowed text-gray-500' : 'cursor-pointer hover:text-blue-500 bg-transparent'}`}
                                            >
                                                <span>Tải lên file</span>
                                                <input
                                                    id="cv-upload"
                                                    name="cv-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf"
                                                    onChange={handleFileChange}
                                                    disabled={isSubmitting}
                                                />
                                            </label>
                                            <p className="pl-1">hoặc kéo thả</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF tối đa 5MB</p>
                                        {cvFile && (
                                            <div className="flex items-center justify-center gap-2 text-green-600 mt-2">
                                                <CheckCircle className="size-4" />
                                                <p className="text-sm font-semibold">
                                                    {cvFile.name}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">
                                Thư giới thiệu (Cover Letter)
                            </label>
                            <textarea
                                id="coverLetter"
                                rows={4}
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Hãy viết đôi lời giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
                                disabled={isSubmitting}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <Link
                                href={`/jobs/${id}`}
                                className={`text-gray-600 hover:text-gray-800 font-medium text-sm px-4 py-2 ${isSubmitting ? 'pointer-events-none opacity-50' : ''}`}
                            >
                                Hủy bỏ
                            </Link>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md shadow-md min-w-[180px]"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                        Đang nộp...
                                    </>
                                ) : (
                                    'Nộp hồ sơ ứng tuyển'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
