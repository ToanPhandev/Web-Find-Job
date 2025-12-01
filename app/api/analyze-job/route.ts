import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Missing GEMINI_API_KEY in environment variables' },
                { status: 500 }
            );
        }

        const { description } = await req.json();

        if (!description) {
            return NextResponse.json(
                { error: 'Missing job description' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `Bạn là một Mentor IT chuyên nghiệp. Hãy phân tích JD dưới đây và đánh giá xem một sinh viên năm 2 có thể ứng tuyển không? Hãy liệt kê 3 keywords kỹ thuật quan trọng nhất cần có. Trả lời ngắn gọn, vui vẻ, định dạng Markdown.

JD:
${description}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ analysis: text });
    } catch (error) {
        console.error('Error analyzing job:', error);
        return NextResponse.json(
            { error: 'Failed to analyze job. Please try again later.' },
            { status: 500 }
        );
    }
}
