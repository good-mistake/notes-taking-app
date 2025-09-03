import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../app/utils/connectDb";
import bcrypt from "bcrypt";
import User from "../../app/models/User";
import mongoose from "mongoose";

const Dummy =
  mongoose.models.Dummy ||
  mongoose.model("Dummy", new mongoose.Schema({}, { strict: false }));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  await connectDb();

  const { password, email } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ error: "Email already in use" });

  const hashed = await bcrypt.hash(password, 10);

  const dummyNotes = await Dummy.find({});
  const user = await User.create({
    email,
    password: hashed,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notes: dummyNotes.map((n: any) => ({
      ...n.toObject(),
      _id: undefined,
      isDummy: false,
    })),
  });

  return res.status(201).json({ message: "User created", userId: user._id });
}
