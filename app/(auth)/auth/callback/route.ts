import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { type EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type') as EmailOtpType | null;
    let next = searchParams.get('next') ?? '/';

    // Định tuyến dựa trên loại xác thực
    if (type === 'signup') {
        next = '/login?verified=true';
    } else if (type === 'recovery') {
        next = '/reset-password';
    }

    const supabase = await createClient();

    try {
        // Ưu tiên sử dụng token_hash (cho Signup/Recovery)
        if (token_hash && type) {
            const { error } = await supabase.auth.verifyOtp({
                token_hash,
                type,
            });
            if (error) throw error;
        }
        // Sau đó mới đến code (PKCE)
        else if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
        } else {
            throw new Error('No auth code or token hash found');
        }

        return NextResponse.redirect(`${origin}${next}`);
    } catch (error: any) {
        console.error('Auth Error:', error.message);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`);
    }
}