import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../app/utils/connectDb";
import bcrypt from "bcrypt";
import User from "../../app/models/User";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  await connectDb();

  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json({ error: "Invalid email or password" });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).json({ error: "Invalid email or password" });

  return res.status(200).json({
    message: "Login successful",
    userId: user._id,
    token: String(user._id),
  });
}
