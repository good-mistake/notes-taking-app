import NextAuth, {
  NextAuthOptions,
  Session,
  User as NextAuthUser,
} from "next-auth";
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
    async signIn({ user }: { user: NextAuthUser }) {
      await connectDb();

      let existing = await User.findOne({ email: user.email });

      if (!existing) {
        const dummyUser = await User.findOne({ email: "dummy@notes.com" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dummyNotes = dummyUser?.notes.filter((n: any) => n.isDummy) || [];

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
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: { token: any; user?: NextAuthUser }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (token as any).id = (user as any).id;
        token.email = user.email;
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: { session: Session; token: any }) {
      if (token) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).id = (token as any).id as string;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
