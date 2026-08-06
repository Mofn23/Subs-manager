import { ensureDatabaseReady, prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await ensureDatabaseReady();

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error("No account found with this email");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
          monthlyBudget: user.monthlyBudget,
          onboarded: user.onboarded,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.currency = (user as any).currency;
        token.monthlyBudget = (user as any).monthlyBudget;
        token.onboarded = (user as any).onboarded;
      }

      if (trigger === "update" && session) {
        if (session.currency !== undefined) token.currency = session.currency;
        if (session.monthlyBudget !== undefined) token.monthlyBudget = session.monthlyBudget;
        if (session.onboarded !== undefined) token.onboarded = session.onboarded;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.currency = (token.currency as string) || "$";
        session.user.monthlyBudget = token.monthlyBudget as number | null;
        session.user.onboarded = (token.onboarded as boolean) ?? false;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "subs-manager-default-secret-2026",
};

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user;
}
