import "dotenv/config";
import connectDb from "../utils/connectDb.js";
import data from "../../../data.json" assert { type: "json" };
import mongoose from "mongoose";
const DummySchema = new mongoose.Schema({}, { strict: false });
const Dummy = mongoose.models.Dummy || mongoose.model("Dummy", DummySchema);
async function seed() {
  await connectDb();
  await Dummy.deleteMany({});
  await Dummy.insertMany(
    data.notes.map((item) => ({ ...item, isDummy: true }))
  );

  console.log("Dummy data seeded");
  process.exit(0);
}
seed();
