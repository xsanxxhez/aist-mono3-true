import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { messages } = await request.json();

    // Отправляем запрос к OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Ты полезный AI-ассистент. Отвечай подробно и помогай пользователю. Поддерживай контекст разговора.'
          },
          ...messages
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({ 
      message: assistantMessage,
      chatId: 'temp-' + Date.now()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Ошибка при обращении к AI' },
      { status: 500 }
    );
  }
}
