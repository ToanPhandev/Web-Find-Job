'use client';

import React, { useState } from 'react';

interface AIJobAnalyzerProps {
    description: string;
}

const AIJobAnalyzer: React.FC<AIJobAnalyzerProps> = ({ description }) => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch('/api/analyze-job', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ description }),
            });

            const data = await response.json();
            if (data.analysis) {
                setResult(data.analysis);
            } else {
                setResult('Không thể phân tích công việc này lúc này. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error analyzing job:', error);
            setResult('Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-8">
            {!result && !loading && (
                <button
                    onClick={handleAnalyze}
                    className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white transition-all duration-200 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                    <span className="mr-2">✨</span>
                    Phân tích độ phù hợp với AI
                </button>
            )}

            {loading && (
                <div className="flex items-center space-x-3 text-purple-700 bg-purple-50 px-4 py-3 rounded-lg border border-purple-100 w-fit">
                    <svg
                        className="animate-spin h-5 w-5 text-purple-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span className="font-medium">Gemini đang đọc JD...</span>
                </div>
            )}

            {result && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center mb-3">
                        <span className="text-xl mr-2">🤖</span>
                        <h4 className="text-lg font-bold text-gray-900">Đánh giá từ Mentor AI</h4>
                    </div>
                    <div className="prose prose-purple max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIJobAnalyzer;
