"use client";

import * as React from "react";
import {
    Briefcase,
    ArrowRight,
    Search,
    MapPin,
    Menu,
    Building2,
    Users,
    TrendingUp,
    CheckCircle2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";

const navigationItems = [
    { title: "VIỆC LÀM", href: "/jobs" },
    { title: "CÔNG TY", href: "/companies" },
    { title: "BLOG", href: "/blog" },
    { title: "LIÊN HỆ", href: "/contact" },
];

const labels = [
    { icon: Building2, label: "Top Công Ty" },
    { icon: Users, label: "Kết Nối Nhân Tài" },
    { icon: TrendingUp, label: "Thăng Tiến Sự Nghiệp" },
];

const features = [
    {
        icon: Search,
        label: "Tìm Kiếm Thông Minh",
        description: "Hệ thống lọc nâng cao giúp bạn tìm thấy công việc phù hợp nhất với kỹ năng.",
    },
    {
        icon: CheckCircle2,
        label: "Công Ty Xác Thực",
        description: "100% nhà tuyển dụng trên nền tảng đều được kiểm duyệt uy tín.",
    },
    {
        icon: MapPin,
        label: "Việc Làm Quanh Bạn",
        description: "Dễ dàng tìm kiếm cơ hội việc làm ngay tại thành phố của bạn hoặc Remote.",
    },
];

export function JobHero() {
    const controls = useAnimation();
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    React.useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [controls, isInView]);

    const titleWords = ["TÌM", "KIẾM", "CÔNG", "VIỆC", "MƠ", "ƯỚC"];

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Dot Pattern Background */}
            <div className="absolute inset-0 -z-10 h-full w-full bg-card text-card-foreground bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <header className="container mx-auto px-4">
                <div className="flex h-20 items-center justify-between">
                    <a href="#" className="flex items-center gap-2">
                        <div className="flex items-center space-x-2">
                            <div className="bg-primary p-2 rounded-lg">
                                <Briefcase className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <span className="font-sans text-xl font-bold tracking-tight">FindJob</span>
                        </div>
                    </a>

                    <nav className="hidden md:flex items-center space-x-8">
                        {navigationItems.map((item) => (
                            <a key={item.title} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                                {item.title}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" className="hidden md:inline-flex font-medium">Đăng nhập</Button>
                        <Button className="rounded-full hidden md:inline-flex bg-primary hover:bg-primary/90 shadow-lg shadow-blue-200">
                            Đăng Tuyển Ngay <ArrowRight className="ml-1 w-4 h-4" />
                        </Button>

                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <nav className="flex flex-col gap-6 mt-6">
                                    {navigationItems.map((item) => (
                                        <a key={item.title} href={item.href} className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                                            {item.title}
                                        </a>
                                    ))}
                                    <Button className="w-full rounded-full bg-primary hover:bg-primary/90">Đăng Tuyển Ngay</Button>
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            <main>
                <section className="container mx-auto px-4 py-20 md:py-32">
                    <div className="flex flex-col items-center text-center">

                        {/* Title Animation */}
                        <motion.h1
                            initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
                            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="relative font-sans text-5xl font-extrabold sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl mx-auto leading-tight tracking-tight text-foreground"
                        >
                            {titleWords.map((text, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.6 }}
                                    className={`inline-block mx-2 md:mx-3 ${index >= 4 ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600' : ''}`}
                                >
                                    {text}
                                </motion.span>
                            ))}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="mx-auto mt-8 max-w-2xl text-xl text-muted-foreground leading-relaxed"
                        >
                            Kết nối với hàng nghìn nhà tuyển dụng hàng đầu. Khám phá cơ hội nghề nghiệp và phát triển bản thân ngay hôm nay.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2, duration: 0.6 }}
                            className="mt-10 flex flex-wrap justify-center gap-4"
                        >
                            {labels.map((feature, index) => (
                                <motion.div
                                    key={feature.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2 + (index * 0.15), duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
                                    className="flex items-center gap-2 px-4 py-2 bg-card text-card-foreground rounded-full border shadow-sm hover:shadow-md transition-shadow cursor-default"
                                >
                                    <feature.icon className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium text-muted-foreground">{feature.label}</span>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6, duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
                        >
                            <Button size="lg" className="h-14 px-8 rounded-full mt-10 text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-blue-200 transition-all hover:scale-105">
                                TÌM VIỆC NGAY <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    </div>
                </section>

                <section className="container mx-auto px-4 pb-24" ref={ref}>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={controls}
                        variants={{ visible: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.6 }}
                        className="text-center text-3xl font-bold mb-12 text-foreground"
                    >
                        Tại sao chọn FindJob?
                    </motion.h2>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={controls}
                        variants={{ visible: { opacity: 1 } }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.label}
                                initial={{ opacity: 0, y: 50 }}
                                animate={controls}
                                variants={{ visible: { opacity: 1, y: 0 } }}
                                transition={{ delay: 0.2 + (index * 0.2), duration: 0.6, type: "spring", stiffness: 100, damping: 10 }}
                                className="flex flex-col items-center text-center p-8 bg-card text-card-foreground rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all"
                            >
                                <div className="mb-6 rounded-2xl bg-primary/10 p-4">
                                    <feature.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="mb-3 text-xl font-bold text-foreground">{feature.label}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
