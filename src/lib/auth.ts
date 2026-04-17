import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import { verifyOtpSchema } from "@/schemas/auth.schema";
import { verifyOtp } from "@/lib/otp";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: { identifier: {}, channel: {}, otp: {}, name: {}, intent: {} },
      async authorize(credentials) {
        const parsed = verifyOtpSchema.safeParse(credentials);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid payload");

        await connectToDatabase();
        const identifier = parsed.data.channel === "email" ? parsed.data.identifier.toLowerCase() : parsed.data.identifier;
        const result = await verifyOtp(identifier, parsed.data.otp);
        if (!result.ok) throw new Error(result.reason);

        const field = parsed.data.channel === "email" ? { email: identifier } : { mobile: identifier };
        const intent = parsed.data.intent ?? "signin";
        const accountName = parsed.data.name?.trim() ?? "";

        let user = await User.findOne(field);

        if (intent === "signin" && !user) {
          throw new Error("No account found. Create one first.");
        }

        if (intent === "signup" && user) {
          throw new Error("Account already exists. Sign in instead.");
        }

        if (!user) {
          user = await User.create({ ...field, name: accountName });
        } else if (!user.name && accountName) {
          user.name = accountName;
          await user.save();
        }

        return {
          id: user._id.toString(),
          email: user.email ?? null,
          role: user.role,
          mobile: user.mobile ?? null,
          name: user.name ?? null,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.mobile = (user as any).mobile;
        token.name = (user as any).name ?? token.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).mobile = token.mobile;
        session.user.name = typeof token.name === "string" ? token.name : session.user.name;
      }
      return session;
    },
  },
};
