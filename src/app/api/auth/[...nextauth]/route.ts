import NextAuth, { DefaultSession } from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Adjust the import path as necessary

// Extend the NextAuth module
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

// Ensure the handler is correctly defined and exported
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };