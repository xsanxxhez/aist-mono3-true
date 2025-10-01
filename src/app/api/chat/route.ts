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

    // Получаем токен с явным указанием секрета
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    console.log('🔐 [chat] Токен:', token ? 'получен' : 'отсутствует');
    console.log('🔐 [chat] User ID из токена:', token?.sub);

    if (!token?.sub) {
      console.log('❌ [chat] Пользователь не авторизован');
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    console.log('✅ [chat] Пользователь авторизован, ID:', token.sub);

    const { messages, chatId, fileContext } = await request.json();

    console.log('💬 [chat] Получен запрос:', {
      chatId,
      fileContextLength: fileContext?.length || 0,
      messagesCount: messages.length
    });

    // Создаем системный промпт
    let systemMessage = 'Ты полезный AI-ассистент. Отвечай подробно и помогай пользователю. Используй markdown разметку для форматирования ответов: **жирный текст**, *курсив*, `код`, списки и т.д.';

    if (fileContext) {
      systemMessage += `\n\nПользователь загрузил файл со следующим содержимым:\n${fileContext}\n\nОтвечай на вопросы учитывая содержимое файла. Если в файле нет информации для ответа, сообщи об этом.`;
      console.log('📋 [chat] Контекст файла добавлен в системный промпт');
    }

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
            content: systemMessage
          },
          ...messages
        ],
        max_tokens: 4000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [chat] OpenRouter ошибка:', errorText);
      throw new Error(`OpenRouter error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    console.log('✅ [chat] Получен ответ от AI, длина:', assistantMessage.length);

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
    console.error('❌ [chat] Ошибка:', error);
    return NextResponse.json(
      { error: 'Ошибка при обращении к AI' },
      { status: 500 }
    );
  }
}