'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Check for verified param
    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setMessage({
                type: 'success',
                text: 'Xác thực tài khoản thành công! Vui lòng đăng nhập.',
            });
        }
    }, [searchParams]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                router.push('/');
            } else {
                // 1. Kiểm tra email đã tồn tại chưa
                const { data: emailExists } = await supabase.rpc('check_email_exists', {
                    email_check: email,
                });

                if (emailExists) {
                    setMessage({
                        type: 'error',
                        text: 'Email này đã được đăng ký. Vui lòng đăng nhập.',
                    });
                    setLoading(false);
                    return;
                }

                // 2. Nếu chưa tồn tại -> Gọi SignUp
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback?next=/login?verified=true`,
                    },
                });
                if (error) throw error;
                setMessage({
                    type: 'success',
                    text: 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.',
                });
            }
        } catch (error: any) {
            let errorMessage = error.message || 'Đã có lỗi xảy ra.';

            if (errorMessage.includes('already registered') || errorMessage.includes('User already registered')) {
                errorMessage = 'Email này đã được đăng kí. Vui lòng đăng nhập hoặc dùng email khác.';
            }

            setMessage({
                type: 'error',
                text: errorMessage,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            {/* Hộp trắng bao trùm TẤT CẢ nội dung */}
            <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border border-gray-100">

                {/* 1. Phần tiêu đề nằm TRONG hộp trắng */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        {isLogin ? 'Chào mừng bạn quay trở lại' : 'Tạo tài khoản mới để bắt đầu'}
                    </p>
                </div>

                {/* 2. Phần thông báo lỗi/thành công */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* 3. Phần Form nhập liệu */}
                <form className="space-y-6" onSubmit={handleAuth}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Mật khẩu
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 pr-10"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-5 w-5" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setMessage(null);
                                }}
                                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
                            >
                                {isLogin ? 'Tạo tài khoản mới' : 'Đăng nhập ngay'}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="text-sm">
                                <Link
                                    href="/forgot-password"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''
                                }`}
                        >
                            {loading ? (
                                <svg
                                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            ) : isLogin ? (
                                'Đăng nhập'
                            ) : (
                                'Đăng ký'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginContent />
        </Suspense>
    );
}