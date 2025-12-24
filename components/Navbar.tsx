'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { LayoutDashboard, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ADMIN_EMAIL = 'toan.pbsg@gmail.com';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isAdminPage = pathname?.startsWith('/admin');

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                            </div>
                            <span className="font-bold text-xl text-gray-900">Find Job</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        {user ? (
                            <>
                                {!isAdminPage && (
                                    <Link
                                        href="/my-applications"
                                        className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Việc đã ứng tuyển
                                    </Link>
                                )}

                                {user.email === ADMIN_EMAIL && (
                                    <Button variant="ghost" asChild className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                        {isAdminPage ? (
                                            <Link href="/">
                                                <Home className="mr-2 h-4 w-4" />
                                                Về Trang Chủ
                                            </Link>
                                        ) : (
                                            <Link href="/admin">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Trang Quản Trị
                                            </Link>
                                        )}
                                    </Button>
                                )}

                                {!isAdminPage && (
                                    <button
                                        onClick={handleLogout}
                                        className="text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        Đăng xuất
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Đăng nhập
                                </Link>
                                <Link
                                    href="/post-job"
                                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm hover:shadow"
                                >
                                    Đăng tin
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMenuOpen && (
                    <div className="sm:hidden bg-white border-t border-gray-100">
                        <div className="pt-2 pb-3 space-y-1 px-4">
                            {user ? (
                                <>


                                    {user.email === ADMIN_EMAIL && (
                                        isAdminPage ? (
                                            <Link
                                                href="/"
                                                className="flex items-center w-full text-left text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <Home className="mr-2 h-4 w-4" />
                                                Về Trang Chủ
                                            </Link>
                                        ) : (
                                            <Link
                                                href="/admin"
                                                className="flex items-center w-full text-left text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Trang Quản Trị
                                            </Link>
                                        )
                                    )}

                                    {!isAdminPage && (
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left text-base font-medium text-gray-500 hover:text-red-600 hover:bg-gray-50 px-3 py-2 rounded-md"
                                        >
                                            Đăng xuất
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="block text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 px-3 py-2 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        href="/post-job"
                                        className="block text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-md"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Đăng tin
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
