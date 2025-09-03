import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDb from "@/app/utils/connectDb";
import User from "@/app/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        if (!user?.email) return false;

        await connectDb();

        let existing = await User.findOne({ email: user.email });
        if (!existing) {
          const dummyUser = await User.findOne({ email: "dummy@notes.com" });
          const dummyNotes =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            dummyUser?.notes.filter((n: any) => n.isDummy) || [];

          existing = await User.create({
            email: user.email,
            password: "google-oauth",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            notes: dummyNotes.map((n: any) => ({
              ...n.toObject(),
              _id: undefined,
              isDummy: false,
            })),
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any).id = existing._id;
        return true;
      } catch (e) {
        console.error("signIn error:", e);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token as any).id = (user as any).id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = (token as any).id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
