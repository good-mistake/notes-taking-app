import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
export interface NoteTypes {
  id: string;
  _id: string;
  title: string;
  tags: string[];
  content: string;
  lastEdited: Date | string;
  isArchived: boolean;
  isDummy?: boolean;
}
export type FilterType = "all" | "archived" | { tag: string };

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      token?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    token?: string;
  }
}
