import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token?.sub) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');

    if (!chatId) {
      return NextResponse.json(
        { error: 'ID чата не указан' },
        { status: 400 }
      );
    }

    // Удаляем чат и все связанные сообщения (каскадное удаление настроено в Prisma)
    await prisma.chat.delete({
      where: {
        id: chatId,
        userId: token.sub,
      },
    });

    console.log('🗑️ [chat] Чат удален:', chatId);

    return NextResponse.json({
      success: true,
      message: 'Чат успешно удален'
    });

  } catch (error) {
    console.error('❌ [chat] Ошибка удаления:', error);

    // Правильная проверка ошибки Prisma
    if (error instanceof Error && 'code' in error && error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Чат не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка при удалении чата' },
      { status: 500 }
    );
  }
}