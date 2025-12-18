// File: utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // 1. Tạo response mặc định
    let supabaseResponse = NextResponse.next({
        request,
    })

    // 2. Khởi tạo Supabase Client để đọc/ghi cookie
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    // Set cookie vào request
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    // Tạo lại response để cập nhật cookie mới
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    // Set cookie vào response gửi về trình duyệt
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 3. Lấy thông tin User hiện tại (Quan trọng: Không dùng getUserData ở đây để tránh lỗi cache)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // --- PHẦN QUAN TRỌNG: LOGIC BẢO MẬT & PHÂN QUYỀN ---
    const path = request.nextUrl.pathname

    // A. BẢO VỆ TRANG ADMIN (/admin)
    if (path.startsWith('/admin')) {
        // Nếu chưa đăng nhập -> Đá về Login
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Nếu đã đăng nhập nhưng KHÔNG PHẢI EMAIL ADMIN -> Đá về trang chủ
        // Thay đổi email này thành email của chính bạn
        if (user.email !== 'toan.pbsg@gmail.com') {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            return NextResponse.redirect(url)
        }
    }

    // B. BẢO VỆ TRANG CÁ NHÂN (/profile, /my-applications...)
    // Những trang này bắt buộc phải đăng nhập mới được xem
    if (path.startsWith('/profile') || path.startsWith('/my-applications') || path.startsWith('/dashboard')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    // C. CHẶN USER ĐÃ LOGIN VÀO LẠI TRANG AUTH (/login, /register)
    if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password')) {
        if (user) {
            const url = request.nextUrl.clone()
            url.pathname = '/' // Nếu đã login rồi thì về trang chủ luôn
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}