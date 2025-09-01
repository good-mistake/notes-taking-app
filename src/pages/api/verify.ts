import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../app/utils/connectDb";
import User from "../../app/models/User";
import bcrypt from "bcrypt";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  await connectDb();
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword)
    return res.status(400).json({ error: "Missing fields" });

  const user = await User.findOne({ email });
  if (!user || !user.resetCode || !user.resetCodeExpires) {
    return res.status(400).json({ error: "Invalid code or email" });
  }

  if (user.resetCode !== String(code) || user.resetCodeExpires < new Date()) {
    return res.status(400).json({ error: "Invalid or expired code" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetCode = null;
  user.resetCodeExpires = null;
  await user.save();

  return res.status(200).json({ message: "Password updated" });
}
