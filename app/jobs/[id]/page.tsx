import React from 'react';
import Link from 'next/link';
import { getJobById } from '@/services/jobService';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: PageProps) {
    const { id } = await params;
    const job = await getJobById(Number(id));

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
                <div className="bg-white p-8 rounded-lg shadow-sm text-center max-w-md w-full">
                    <svg
                        className="w-16 h-16 text-gray-300 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Không tìm thấy công việc
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Công việc bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
                    >
                        Quay lại trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-4">
                        <Link
                            href="/"
                            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 mb-4 w-fit"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                ></path>
                            </svg>
                            Quay lại danh sách
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                            {job.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600">
                            <span className="font-medium text-gray-900 flex items-center gap-1">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                    ></path>
                                </svg>
                                {job.company}
                            </span>
                            <span className="flex items-center gap-1">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    ></path>
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    ></path>
                                </svg>
                                {job.location}
                            </span>
                            <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                                {job.salary}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {job.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
                        Mô tả công việc
                    </h3>
                    <div className="prose max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
                        {job.description}
                    </div>
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="hidden sm:block">
                        <p className="text-sm text-gray-500">Bạn đang xem công việc tại</p>
                        <p className="font-bold text-gray-900">{job.company}</p>
                    </div>
                    <Link
                        href={`/jobs/${job.id}/apply`}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                        Ứng tuyển ngay
                    </Link>
                </div>
            </div>
        </main>
    );
}
