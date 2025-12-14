import Link from "next/link";
import { Briefcase, ChevronLeft } from "lucide-react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Flex-col giúp chia màn hình thành 2 phần: Header (trên) và Main (dưới)
        <div className="min-h-screen flex flex-col bg-gray-50">

            {/* --- PHẦN HEADER (Navbar) --- */}
            <header className="flex w-full items-center justify-between p-6 sm:px-10">
                {/* Bên trái: Logo thương hiệu */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600">
                    <Briefcase className="h-6 w-6" />
                    <span>Find Job</span>
                </Link>

                {/* Bên phải: Nút quay về */}
                <Link
                    href="/"
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Về trang chủ
                </Link>
            </header>

            {/* --- PHẦN NỘI DUNG (Form) --- */}
            {/* flex-1 để nó chiếm toàn bộ khoảng trống còn lại và căn giữa form */}
            <main className="flex-1 flex items-center justify-center p-4 pb-20">
                <div className="w-full max-w-[450px]">
                    {children}
                </div>
            </main>

        </div>
    );
}