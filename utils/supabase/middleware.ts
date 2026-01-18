import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // 1. Khởi tạo Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // 2. Lấy thông tin User hiện tại
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname;

    // --- CẤU HÌNH CÁC TRANG CÔNG KHAI (Ai cũng vào được) ---
    const isPublicPage =
        path === '/' ||                       // Trang chủ (Landing Page)
        path.startsWith('/login') ||          // Trang đăng nhập
        path.startsWith('/auth') ||           // Các api auth
        path.startsWith('/verify-email');     // Trang xác thực email

    // 3. LOGIC BẢO VỆ:

    // TRƯỜNG HỢP A: Chưa đăng nhập mà cố vào trang nội bộ (không phải public)
    // => Đuổi về trang Login
    if (!user && !isPublicPage) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // TRƯỜNG HỢP B: Đã đăng nhập rồi mà lại vào trang Login hoặc Trang chủ
    // => Chuyển thẳng vào Dashboard (/jobs) cho tiện
    if (user && (path === '/login' || path === '/')) {
        const url = request.nextUrl.clone()
        url.pathname = '/jobs'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}