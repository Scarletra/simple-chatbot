import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, attachedFiles } = await request.json();

    // Prepare context for file attachments
    let contextMessage = message;
    if (attachedFiles && attachedFiles.length > 0) {
      const fileInfo = attachedFiles.map((file: any) => 
        `File: ${file.name} (${file.type}, ${file.size} bytes)`
      ).join('\n');
      contextMessage = `${message}\n\nAttached files:\n${fileInfo}`;
    }

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah Scarletbot, asisten AI yang membantu dalam bahasa Indonesia. Jawab dengan ramah dan informatif.'
        },
        {
          role: 'user',
          content: contextMessage,
        },
      ],
      model: 'llama-3.3-70b-versatile', 
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda.';

    return NextResponse.json({ 
      success: true, 
      response,
      shouldShowRecommendation: message.toLowerCase().includes('berikan rekomendasi terkait topik')
    });

  } catch (error) {
    console.error('Error calling Groq API:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses permintaan' },
      { status: 500 }
    );
  }
}