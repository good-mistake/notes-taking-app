import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "@/app/utils/connectDb";
import User from "@/app/models/User";
import { sendResetLink } from "@/app/utils/mail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await connectDb();
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "No account with that email" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await sendResetLink(email, user._id.toString());

    return res.status(200).json({ message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
