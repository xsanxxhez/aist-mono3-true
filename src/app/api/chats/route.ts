import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request });
  
  if (!token?.sub) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  }

  try {
    return NextResponse.json({ 
      chats: [],
      message: 'История чатов временно недоступна'
    });
  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { error: 'Ошибка при получении чатов' },
      { status: 500 }
    );
  }
}
