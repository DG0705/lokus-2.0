import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/db";
import { verifyOtpSchema } from "@/schemas/auth.schema";
import { verifyOtp } from "@/lib/otp";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "OTP",
      credentials: { identifier: {}, channel: {}, otp: {} },
      async authorize(credentials) {
        const parsed = verifyOtpSchema.safeParse(credentials);
        if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid payload");

        await connectToDatabase();
        const result = await verifyOtp(parsed.data.identifier, parsed.data.otp);
        if (!result.ok) throw new Error(result.reason);

        const field = parsed.data.channel === "email"
          ? { email: parsed.data.identifier.toLowerCase() }
          : { mobile: parsed.data.identifier };

        const user = await User.findOneAndUpdate(field, { $setOnInsert: field }, { upsert: true, new: true });
        return { id: user._id.toString(), email: user.email ?? null, role: user.role, mobile: user.mobile ?? null } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
        token.mobile = (user as any).mobile;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).mobile = token.mobile;
      }
      return session;
    },
  },
};
