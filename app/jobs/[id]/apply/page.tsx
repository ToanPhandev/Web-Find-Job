'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function JobApplicationPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [cvFile, setCvFile] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Logic gửi form sẽ được implement sau
        alert('Nộp hồ sơ thành công! (Demo)');
        router.push('/');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-blue-600 py-6 px-8">
                        <h1 className="text-2xl font-bold text-white">
                            Ứng tuyển vị trí công việc
                        </h1>
                        <p className="text-blue-100 mt-1">
                            Vui lòng điền đầy đủ thông tin bên dưới để ứng tuyển.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="py-8 px-8 space-y-6">
                        {/* Full Name */}
                        <div>
                            <label
                                htmlFor="fullname"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="fullname"
                                required
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-500 text-gray-900"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        {/* Email & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-500 text-gray-900"
                                    placeholder="example@email.com"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                    Số điện thoại <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-500 text-gray-900"
                                    placeholder="0901234567"
                                />
                            </div>
                        </div>

                        {/* Upload CV */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                CV / Hồ sơ năng lực (PDF) <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors duration-200 bg-gray-50 hover:bg-blue-50 cursor-pointer relative">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth={2}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <label
                                            htmlFor="cv-upload"
                                            className="relative cursor-pointer bg-transparent rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                        >
                                            <span>Tải lên file</span>
                                            <input
                                                id="cv-upload"
                                                name="cv-upload"
                                                type="file"
                                                className="sr-only"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                required
                                            />
                                        </label>
                                        <p className="pl-1">hoặc kéo thả vào đây</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF tối đa 5MB</p>
                                    {cvFile && (
                                        <p className="text-sm text-green-600 font-semibold mt-2">
                                            Đã chọn: {cvFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cover Letter */}
                        <div>
                            <label
                                htmlFor="coverLetter"
                                className="block text-sm font-medium text-gray-700 mb-1"
                            >
                                Thư giới thiệu (Cover Letter)
                            </label>
                            <textarea
                                id="coverLetter"
                                rows={4}
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 placeholder:text-gray-500 text-gray-900"
                                placeholder="Hãy viết đôi lời giới thiệu về bản thân và lý do bạn phù hợp với vị trí này..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                            <Link
                                href={`/jobs/${id}`}
                                className="text-gray-600 hover:text-gray-800 font-medium text-sm px-4 py-2"
                            >
                                Hủy bỏ
                            </Link>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 w-full sm:w-auto"
                            >
                                Nộp hồ sơ ứng tuyển
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
