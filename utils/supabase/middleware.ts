// File: utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    // 1. Khởi tạo Response mặc định
    let supabaseResponse = NextResponse.next({
        request,
    })

    // 2. Khởi tạo Supabase Client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
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

    // 3. Lấy User (QUAN TRỌNG: getUser sẽ kích hoạt refresh token nếu cần)
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 4. Định nghĩa các Rules Redirect
    const path = request.nextUrl.pathname

    // --- Helper để Redirect mà KHÔNG LÀM MẤT COOKIE (Fix lỗi Mobile Session) ---
    const redirectWithCookies = (newPath: string) => {
        const url = request.nextUrl.clone()
        url.pathname = newPath

        // Nếu user bị đá về login từ trang bảo vệ, lưu lại trang đích vào ?next=
        if (newPath === '/login' && !path.startsWith('/login')) {
            url.searchParams.set('next', path)
        }

        const newResponse = NextResponse.redirect(url)

        // COPY Cookies từ supabaseResponse (chứa session mới) sang response redirect
        const cookiesToSet = supabaseResponse.cookies.getAll()
        cookiesToSet.forEach(cookie => {
            newResponse.cookies.set(cookie.name, cookie.value)
        })

        return newResponse
    }

    // A. BẢO VỆ TRANG ADMIN (/admin)
    if (path.startsWith('/admin')) {
        if (!user) return redirectWithCookies('/login')

        if (user.email !== 'toan.pbsg@gmail.com') {
            return redirectWithCookies('/')
        }
    }

    // B. BẢO VỆ TRANG CÁ NHÂN (/profile, /my-applications...)
    if (path.startsWith('/profile') || path.startsWith('/my-applications') || path.startsWith('/dashboard')) {
        if (!user) return redirectWithCookies('/login')
    }

    // C. CHẶN USER ĐÃ LOGIN VÀO LẠI TRANG AUTH (/login, /register)
    if (path.startsWith('/login') || path.startsWith('/register') || path.startsWith('/forgot-password')) {
        if (user) return redirectWithCookies('/')
    }

    // Trả về response mặc định (đã set cookie nếu có refresh)
    return supabaseResponse
}