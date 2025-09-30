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
    return markdown; // Возвращаем оригинал в случае ошибки
  }
}

// Функция для очистки HTML от потенциально опасных тегов
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/javascript:/gi, '');
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token?.sub) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { messages, chatId, fileContext } = await request.json();

    console.log('💬 [chat] Получен запрос:', {
      chatId,
      fileContextLength: fileContext?.length || 0,
      fileContextPreview: fileContext?.substring(0, 100) || 'нет',
      messagesCount: messages.length
    });

    // Создаем системный промпт с учетом контекста файла
    let systemMessage = 'Ты полезный AI-ассистент. Отвечай подробно и помогай пользователю. Поддерживай контекст разговора. Используй markdown разметку для форматирования ответов: **жирный текст**, *курсив*, `код`, списки и т.д.';

    if (fileContext) {
      systemMessage += `\n\nПользователь загрузил файл со следующим содержимым:\n${fileContext}\n\nОтвечай на вопросы учитывая содержимое файла. Если в файле нет информации для ответа, сообщи об этом.`;
      console.log('📋 [chat] Контекст файла добавлен в системный промпт');
    } else {
      console.log('⚠️ [chat] Контекст файла отсутствует');
    }

    console.log('🔧 [chat] Системный промпт (первые 200 символов):', systemMessage.substring(0, 200));

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
    console.log('📝 [chat] Преобразую markdown в HTML...');

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