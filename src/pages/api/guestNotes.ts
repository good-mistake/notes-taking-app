import type { NextApiRequest, NextApiResponse } from "next";
import connectDb from "../../app/utils/connectDb";
import mongoose from "mongoose";

const DummySchema = new mongoose.Schema({}, { strict: false });
const Dummy = mongoose.models.Dummy || mongoose.model("Dummy", DummySchema);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectDb();
  if (req.method !== "GET") return res.status(405).end();

  const notes = await Dummy.find({ isDummy: true }).lean();
  res.status(200).json(notes);
}
