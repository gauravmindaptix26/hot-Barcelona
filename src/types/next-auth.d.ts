import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      gender?: "female" | "male";
      isAdmin?: boolean;
      accountType?: "user" | "advertiser";
      advertiserType?: "girls" | "trans";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    gender?: "female" | "male" | null;
    isAdmin?: boolean;
    accountType?: "user" | "advertiser";
    advertiserType?: "girls" | "trans" | null;
  }
}

export {};
