import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getToken } from 'next-auth/jwt';

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const chatId = formData.get('chatId') as string;

    if (!file) {
      return NextResponse.json({ error: 'Файл не предоставлен' }, { status: 400 });
    }

    // Создаем директорию uploads если её нет
    const uploadsDir = join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (e) {
      console.log('Директория uploads уже существует');
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    const path = join(uploadsDir, filename);

    // Конвертируем File в Buffer и сохраняем
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(path, buffer);

    return NextResponse.json({ 
      success: true,
      file: {
        filename,
        originalName,
        path,
        size: buffer.length,
        mimeType: file.type,
      },
      message: 'Файл успешно загружен!'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500 }
    );
  }
}
