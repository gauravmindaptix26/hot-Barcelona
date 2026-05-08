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
    accountType?: "user" | "advertiser";
    advertiserType?: "girls" | "trans";
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
        accountType: { label: "Account type", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const normalizedEmail = credentials.email.trim().toLowerCase();
        const normalizedPassword = credentials.password.trim();
        const requestedAccountType =
          credentials.accountType === "users" ||
          credentials.accountType === "girls" ||
          credentials.accountType === "trans"
            ? credentials.accountType
            : null;
        if (!normalizedEmail || !normalizedPassword) {
          return null;
        }

        const limiter = rateLimit(`login:${normalizedEmail}`, 20, 60_000);
        if (!limiter.allowed) {
          return null;
        }

        void ensureUsersIndexes();
        const db = await getDb();
        const user =
          !requestedAccountType || requestedAccountType === "users"
            ? await db.collection("users").findOne({
                email: normalizedEmail,
              })
            : null;

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
              accountType: "user",
            };
          }
        }

        if (requestedAccountType === "users") {
          return null;
        }

        const advertiserCollections =
          requestedAccountType === "girls" || requestedAccountType === "trans"
            ? [requestedAccountType]
            : ["girls", "trans"];

        for (const collectionName of advertiserCollections) {
          const advertisers = await db
            .collection(collectionName)
            .find(
              {
                email: normalizedEmail,
                isDeleted: { $ne: true },
              },
              {
                projection: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  formFields: 1,
                  passwordHash: 1,
                },
              }
            )
            .toArray();

          for (const advertiser of advertisers) {
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
              accountType: "advertiser",
              advertiserType: collectionName,
            };
          }
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
        const rawAccountType = (user as { accountType?: string }).accountType;
        token.accountType =
          rawAccountType === "advertiser" ? "advertiser" : "user";
        const rawAdvertiserType = (user as { advertiserType?: string }).advertiserType;
        token.advertiserType =
          rawAdvertiserType === "girls" || rawAdvertiserType === "trans"
            ? rawAdvertiserType
            : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.gender = token.gender as "female" | "male" | undefined;
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.accountType =
          token.accountType === "advertiser" ? "advertiser" : "user";
        session.user.advertiserType =
          token.advertiserType === "girls" || token.advertiserType === "trans"
            ? token.advertiserType
            : undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const getAppServerSession = () =>
  getServerSession(authOptions) as Promise<AppSession | null>;
