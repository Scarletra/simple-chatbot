import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  data?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, attachedFiles } = await request.json();

    const parts: any[] = [
      {
        text: `Kamu adalah Scarletbot, asisten AI yang membantu dalam bahasa Indonesia. Jawab dengan ramah dan informatif.\n\n${message}`,
      },
    ];

    if (attachedFiles && attachedFiles.length > 0) {
      for (const file of attachedFiles as AttachedFile[]) {
        if (file.data && file.type.startsWith('image/')) {
          const base64Data = file.data.includes(',') 
            ? file.data.split(',')[1] 
            : file.data;
          
          parts.push({
            inline_data: {
              mime_type: file.type,
              data: base64Data,
            },
          });
        } else if (file.data) {
          parts[0].text += `\n\nFile terlampir: ${file.name} (${file.type})`;
        } else {
          parts[0].text += `\n\nFile terlampir: ${file.name} (${file.type}) - tidak dapat diproses`;
        }
      }
    }

    const requestBody = {
      contents: [
        {
          parts: parts,
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 32,
        topP: 1,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      ],
    };

    console.log('Sending request to Gemini:', JSON.stringify(requestBody, null, 2));

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API Error:', errorData);
      throw new Error(`Gemini API Error: ${geminiResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await geminiResponse.json();
    console.log('Gemini response:', JSON.stringify(data, null, 2));

    if (data.error) {
      console.error('Gemini returned error:', data.error);
      return NextResponse.json(
        { success: false, error: `Gemini API Error: ${data.error.message}` },
        { status: 400 }
      );
    }

    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in response:', data);
      return NextResponse.json(
        { success: false, error: 'Tidak ada response dari Gemini' },
        { status: 400 }
      );
    }

    const candidate = data.candidates[0];
    
    if (candidate.finishReason === 'SAFETY') {
      return NextResponse.json(
        { success: false, error: 'Konten diblokir oleh safety filter' },
        { status: 400 }
      );
    }

    const response = candidate?.content?.parts?.[0]?.text ?? 'Maaf, saya tidak dapat memproses permintaan Anda.';

    return NextResponse.json({
      success: true,
      response,
      shouldShowRecommendation: message.toLowerCase().includes('berikan rekomendasi terkait topik'),
    });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { success: false, error: `Terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}