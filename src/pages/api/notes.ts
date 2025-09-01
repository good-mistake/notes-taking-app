import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../app/utils/connectDb";
import User, { INote } from "../../app/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import type { Session } from "next-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDb();

  // try NextAuth session first (may be null)
  const session = (await getServerSession(
    req,
    res,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authOptions as any
  )) as Session | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionUser: any = session?.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let user: any | null = null;

  if (sessionUser?.id) {
    user = await User.findById(sessionUser.id);
  } else if (sessionUser?.email) {
    user = await User.findOne({ email: sessionUser.email });
  }
  if (!user) {
    const auth = (req.headers.authorization || "").trim();
    const parts = auth.split(" ");
    if (parts[0].toLowerCase() === "bearer" && parts[1]) {
      const userId = parts[1];
      user = await User.findById(userId);
    }
  }

  if (!user) return res.status(401).json({ error: "Not authenticated" });

  switch (req.method) {
    case "GET":
      return res.status(200).json(user.notes);

    case "POST": {
      const newNote = {
        title: req.body.title,
        content: req.body.content,
        lastEdited: new Date(),
      };
      user.notes.push(newNote);
      await user.save();
      const created = user.notes[user.notes.length - 1];
      return res.status(201).json(created);
    }

    case "PUT": {
      const { id, ...update } = req.body;
      const note = user.notes.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (n: INote) => String((n as any)._id || (n as any).id) === String(id)
      );
      if (!note) return res.status(404).json({ error: "Note not found" });

      Object.assign(note, update, { lastEdited: new Date() });
      await user.save();
      return res.status(200).json(note);
    }

    case "DELETE": {
      const { id } = req.body;
      const beforeCount = user.notes.length;
      user.notes = user.notes.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (n: INote) => String((n as any)._id || (n as any).id) !== String(id)
      );
      const afterCount = user.notes.length;

      if (beforeCount === afterCount) {
        return res.status(404).json({ error: "Note not found" });
      }

      await user.save();
      return res.status(200).json({ message: "Deleted", id });
    }

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
