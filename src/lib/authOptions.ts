import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { Profile } from "next-auth";

interface GitHubProfile extends Omit<Profile, 'name' | 'email'> {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  updated_at: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "read:user user:email repo",
        },
      },
      profile(profile: GitHubProfile) {
        console.log("GitHub Profile received:", {
          id: profile.id,
          login: profile.login,
          hasEmail: !!profile.email,
          hasName: !!profile.name,
          raw: profile // Log the raw profile for debugging
        });
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || "",
          image: profile.avatar_url,
          login: profile.login,
          bio: profile.bio,
          company: profile.company,
          location: profile.location,
          followers: profile.followers,
          following: profile.following,
          public_repos: profile.public_repos,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  logger: {
    error(code, ...message) {
      console.error('NextAuth Error:', { code, message });
    },
    warn(code, ...message) {
      console.warn('NextAuth Warning:', { code, message });
    },
    debug(code, ...message) {
      console.log('NextAuth Debug:', { code, message });
    },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log("JWT Callback:", {
        hasToken: !!token,
        hasAccount: !!account,
        hasProfile: !!profile,
        tokenKeys: token ? Object.keys(token) : [],
        accountDetails: account ? {
          type: account.type,
          provider: account.provider,
          hasAccessToken: !!account.access_token,
          scope: account.scope
        } : null
      });

      if (account && profile) {
        token.accessToken = account.access_token;
        const githubProfile = profile as GitHubProfile;
        token.id = githubProfile.id.toString();
        token.login = githubProfile.login;
        token.bio = githubProfile.bio;
        token.company = githubProfile.company;
        token.location = githubProfile.location;
        token.followers = githubProfile.followers;
        token.following = githubProfile.following;
        token.public_repos = githubProfile.public_repos;
        token.created_at = githubProfile.created_at;
        token.updated_at = githubProfile.updated_at;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Session Callback:", {
        hasSession: !!session,
        hasToken: !!token,
        sessionKeys: session ? Object.keys(session) : [],
        tokenKeys: token ? Object.keys(token) : []
      });

      if (token) {
        session.accessToken = token.accessToken as string;
        session.user.id = token.id as string;
        session.user.login = token.login as string;
        session.user.bio = token.bio as string | null;
        session.user.company = token.company as string | null;
        session.user.location = token.location as string | null;
        session.user.followers = token.followers as number;
        session.user.following = token.following as number;
        session.user.public_repos = token.public_repos as number;
        session.user.created_at = token.created_at as string;
        session.user.updated_at = token.updated_at as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("SignIn Callback - Start:", {
        hasUser: !!user,
        hasAccount: !!account,
        hasProfile: !!profile,
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        userDetails: user ? {
          id: user.id,
          email: user.email,
          name: user.name
        } : null,
        accountDetails: account ? {
          type: account.type,
          provider: account.provider,
          hasAccessToken: !!account.access_token
        } : null
      });

      if (!user || !account || !profile) {
        console.error("SignIn Callback - Missing Data:", {
          hasUser: !!user,
          hasAccount: !!account,
          hasProfile: !!profile
        });
        return false;
      }

      try {
        const githubProfile = profile as GitHubProfile;
        console.log("SignIn Callback - API Request:", {
          url: `${process.env.NEXT_PUBLIC_API_URL}/auth/user`,
          githubId: githubProfile.id,
          username: githubProfile.login
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${account.access_token}`,
          },
          body: JSON.stringify({
            githubId: githubProfile.id,
            username: githubProfile.login,
            email: user.email,
            name: user.name,
            avatarUrl: user.image,
            accessToken: account.access_token,
            profile: {
              bio: githubProfile.bio,
              company: githubProfile.company,
              location: githubProfile.location,
              followers: githubProfile.followers,
              following: githubProfile.following,
              public_repos: githubProfile.public_repos,
              created_at: githubProfile.created_at,
              updated_at: githubProfile.updated_at,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("SignIn Callback - API Error:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            headers: Object.fromEntries(response.headers.entries())
          });
          return false;
        }

        console.log("SignIn Callback - Success");
        return true;
      } catch (error) {
        console.error("SignIn Callback - Exception:", {
          error: error instanceof Error ? {
            message: error.message,
            stack: error.stack
          } : error,
          type: typeof error
        });
        return false;
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/error",
  },
  session: {
    strategy: "jwt",
  },
};