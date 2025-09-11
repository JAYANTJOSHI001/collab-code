import NextAuth, { DefaultSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; 

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user: {
      id: string;
      login: string;
      email: string;
      name: string;
      image: string;
      bio?: string | null;
      company?: string | null;
      location?: string | null;
      followers?: number;
      following?: number;
      public_repos?: number;
      created_at?: string;
      updated_at?: string;
    } & DefaultSession["user"];
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };