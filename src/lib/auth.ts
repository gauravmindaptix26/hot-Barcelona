import type { NextAuthOptions, Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ensureUsersIndexes, getDb } from "./db";
import { isAdminEmail } from "./admin";
import { rateLimit } from "./rate-limit";

export type AppSession = Session & {
  user: NonNullable<Session["user"]> & {
    id: string;
    gender?: "female" | "male";
    isAdmin?: boolean;
  };
};

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const normalizedPassword = credentials.password.trim();
        if (!normalizedEmail || !normalizedPassword) {
          return null;
        }

        const limiter = rateLimit(`login:${normalizedEmail}`, 20, 60_000);
        if (!limiter.allowed) {
          return null;
        }

        void ensureUsersIndexes();
        const db = await getDb();
        const user = await db.collection("users").findOne({
          email: normalizedEmail,
        });

        if (user?.passwordHash) {
          const isValid = await bcrypt.compare(
            normalizedPassword,
            user.passwordHash
          );

          if (isValid) {
            return {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              gender: user.gender,
            };
          }
        }

        for (const collectionName of ["girls", "trans"]) {
          const advertiser = await db.collection(collectionName).findOne({
            email: normalizedEmail,
            isDeleted: { $ne: true },
          });

          if (!advertiser?.passwordHash) continue;

          const isValidAdvertiser = await bcrypt.compare(
            normalizedPassword,
            advertiser.passwordHash
          );

          if (!isValidAdvertiser) continue;

          return {
            id: advertiser._id.toString(),
            name: advertiser.name || advertiser.formFields?.stageName || "Advertiser",
            email: advertiser.email,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        const rawGender = (user as { gender?: string }).gender;
        token.gender = rawGender === "female" || rawGender === "male" ? rawGender : null;
        const rawEmail = (user as { email?: string | null }).email ?? null;
        token.isAdmin = isAdminEmail(rawEmail);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.gender = token.gender as "female" | "male" | undefined;
        session.user.isAdmin = Boolean(token.isAdmin);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getAppServerSession = () =>
  getServerSession(authOptions) as Promise<AppSession | null>;
