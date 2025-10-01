import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { remark } from 'remark';
import html from 'remark-html';

// Функция для преобразования markdown в HTML
async function markdownToHtml(markdown: string): Promise<string> {
  try {
    const result = await remark().use(html).process(markdown);
    return result.toString();
  } catch (error) {
    console.error('❌ [markdown] Ошибка преобразования:', error);
    return markdown;
  }
}

// Функция для очистки HTML
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:/gi, '');
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 [chat] Проверка авторизации...');

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    console.log('🔐 [chat] Токен данные:', {
      hasToken: !!token,
      userId: token?.sub,
      email: token?.email
    });

    if (!token?.sub) {
      console.log('❌ [chat] Пользователь не авторизован');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    console.log('✅ [chat] Пользователь авторизован, ID:', token.sub);

    const { messages, chatId, fileContext } = await request.json();

    console.log('💬 [chat] Получен запрос:', {
      chatId,
      fileContextLength: fileContext?.length || 0,
      messagesCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content?.substring(0, 100)
    });

    // Проверяем наличие API ключа OpenRouter
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('❌ [chat] OPENROUTER_API_KEY не установлен');
      return NextResponse.json(
        { error: 'API ключ не настроен' },
        { status: 500 }
      );
    }

    // Создаем системный промпт
    let systemMessage = 'Ты полезный AI-ассистент. Отвечай подробно и помогай пользователю. Используй markdown разметку для форматирования ответов: **жирный текст**, *курсив*, `код`, списки и т.д.';

    if (fileContext && fileContext !== '[Нет загруженных файлов]') {
      systemMessage += `\n\nПользователь загрузил файл со следующим содержимым:\n${fileContext.substring(0, 10000)}\n\nОтвечай на вопросы учитывая содержимое файла. Если в файле нет информации для ответа, сообщи об этом.`;
      console.log('📋 [chat] Контекст файла добавлен в системный промпт');
    }

    console.log('🚀 [chat] Отправка запроса к OpenRouter...');

    // Отправляем запрос к OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://aist-mono3-true-5vye.vercel.app',
        'X-Title': 'AIST Chat Assistant',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          ...messages
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    console.log('📡 [chat] Статус ответа OpenRouter:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [chat] OpenRouter ошибка:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });

      let errorMessage = 'Ошибка при обращении к AI';
      if (response.status === 401) {
        errorMessage = 'Неверный API ключ OpenRouter';
      } else if (response.status === 429) {
        errorMessage = 'Превышен лимит запросов к AI';
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    const data = await response.json();
    console.log('✅ [chat] Получен ответ от OpenRouter');

    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      console.error('❌ [chat] Пустой ответ от AI');
      return NextResponse.json(
        { error: 'AI не вернул ответ' },
        { status: 500 }
      );
    }

    console.log('✅ [chat] Ответ от AI, длина:', assistantMessage.length);

    // Преобразуем markdown в HTML
    const messageHtml = await markdownToHtml(assistantMessage);
    const sanitizedHtml = sanitizeHtml(messageHtml);

    console.log('🎨 [chat] Markdown преобразован в HTML');

    return NextResponse.json({
      message: assistantMessage,
      messageHtml: sanitizedHtml,
      chatId: chatId || 'temp-' + Date.now()
    });

  } catch (error) {
    console.error('❌ [chat] Неожиданная ошибка:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}