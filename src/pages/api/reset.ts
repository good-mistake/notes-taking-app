import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../app/utils/connectDb";
import User from "../../app/models/User";
import { sendResetLink } from "../../app/utils/mail";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  await connectDb();
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(200)
      .json({ message: "If that email exists, a reset link was sent" });
  }

  try {
    await sendResetLink(email, user._id.toString());
  } catch (err) {
    return res.status(500).json({ error: "Failed to send email" });
  }

  return res
    .status(200)
    .json({ message: "If that email exists, a reset link was sent" });
}
