import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

// Временная конфигурация без Prisma для тестирования
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    })
  ],
  session: {
    strategy: 'jwt', // Используем JWT вместо database сессий временно
  },
  callbacks: {
    async session({ session, token }) {
      // Добавляем ID пользователя в сессию
      if (session.user) {
        session.user.id = token.sub || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  }
});

export { handler as GET, handler as POST };
