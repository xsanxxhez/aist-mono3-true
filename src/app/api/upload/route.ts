import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getToken } from 'next-auth/jwt';
import { extractTextFromFile } from '@/lib/fileProcessor';

export async function POST(request: NextRequest) {
  console.log('🔍 [upload] Запрос получен');
  const token = await getToken({ req: request });

  if (!token?.sub) {
    console.log('❌ [upload] Пользователь не авторизован');
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    console.log('📁 [upload] Получен файл:', {
      name: file?.name,
      type: file?.type,
      size: file?.size,
      chatId: chatId
    });

    if (!file) {
      console.log('❌ [upload] Файл не предоставлен');
      return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 });
    }

    // Создаем директорию uploads если её нет
    const uploadsDir = join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('✅ [upload] Директория uploads создана/проверена');
    } catch {
      console.log('📁 [upload] Директория uploads уже существует');
    }

    // Генерируем безопасное имя файла
    const timestamp = Date.now();
    const originalName = file.name;
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileExtension = safeName.split('.').pop() ||
      (file.type === 'application/pdf' ? 'pdf' :
       file.type.includes('word') ? 'docx' : 'txt');
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const path = join(uploadsDir, filename);

    // Конвертируем File в Buffer и сохраняем
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path, buffer);

    console.log('💾 [upload] Файл сохранен:', path);

    // Извлекаем текст
    let fileContent = '';
    try {
      fileContent = await extractTextFromFile(path, file.type);
      console.log('✅ [upload] Текст извлечен, длина:', fileContent.length);
    } catch (extractError) {
      console.error('❌ [upload] Ошибка извлечения текста:', extractError);
      fileContent = '[Не удалось извлечь текст из файла]';
    }

    const result = {
      success: true,
      file: {
        filename,
        originalName,
        path,
        size: buffer.length,
        mimeType: file.type,
        content: fileContent
      },
      message: 'Файл успешно загружен и обработан!'
    };

    console.log('✅ [upload] Успешный результат:', {
      filename: result.file.filename,
      type: result.file.mimeType,
      contentLength: result.file.content.length
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ [upload] Критическая ошибка:', error);
    return NextResponse.json(
      { error: `Ошибка при загрузке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` },
      { status: 500 }
    );
  }
}