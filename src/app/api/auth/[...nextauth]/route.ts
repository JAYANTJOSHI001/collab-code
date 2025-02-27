import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async redirect({url, baseUrl}: {url: string, baseUrl: string}) {
      return "/git"; // Always redirect to /git after authentication
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
