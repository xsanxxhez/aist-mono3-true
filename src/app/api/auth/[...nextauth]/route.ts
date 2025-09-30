import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const handler = NextAuth({
providers: [
GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      // Теперь TypeScript знает о поле id благодаря нашим типам
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