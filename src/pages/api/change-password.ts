import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../app/utils/connectDb";
import bcrypt from "bcrypt";
import User from "../../app/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import jwt from "jsonwebtoken";

function looksLikeObjectId(s?: string) {
  return typeof s === "string" && /^[0-9a-fA-F]{24}$/.test(s);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  await connectDb();

  const session = await getServerSession(req, res, authOptions);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userId: string | undefined = (session?.user as any)?.id;

  if (!userId) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as {
          userId?: string;
        };
        if (decoded?.userId) userId = decoded.userId;
      } catch (jwtErr) {
        if (looksLikeObjectId(token)) {
          userId = token;
        } else {
          return res.status(401).json({ error: "Invalid/expired token" });
        }
      }
    }
  }

  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: "Old and new passwords required" });
  if (newPassword.length < 8)
    return res
      .status(400)
      .json({ error: "New password must be at least 8 characters" });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const match = await bcrypt.compare(oldPassword, user.password);
  if (!match) return res.status(403).json({ error: "Wrong old password" });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.status(200).json({ message: "Password changed" });
}
