import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Briefcase, ArrowRight, CheckCircle2 } from "lucide-react";
import { ToggleTheme } from "@/components/ToggleTheme";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 1. Navbar */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Briefcase className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">FindJob</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login">
            <Button variant="ghost">Đăng nhập</Button>
          </Link>
          <ToggleTheme />
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#2d2d2d_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            Khởi đầu hành trình <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              sự nghiệp của bạn
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Kết nối với hơn 5000+ doanh nghiệp hàng đầu. Tìm việc làm mơ ước ngay hôm nay.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {/* Redirects to Login, intended to go to /jobs after success */}
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 transition-transform hover:scale-105">
                Tìm Việc Ngay <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="pt-12 flex flex-wrap justify-center gap-8 text-sm font-medium text-muted-foreground">
            <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Việc làm đã xác thực</div>
            <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Kết nối trực tiếp với nhà tuyển dụng </div>
            <div className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Hỗ trợ nộp CV Online</div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
        © 2024 FindJob Platform. All rights reserved.
      </footer>
    </div>
  );
}
