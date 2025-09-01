import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface INote {
  id: string;
  title: string;
  tags: string[];
  content: string;
  lastEdited: Date;
  isArchived: boolean;
  isDummy?: boolean;
}

export interface IUser extends Document {
  email: string;
  password: string;
  createdAt: Date;
  notes: INote[];
  resetCode?: string | null;
  resetCodeExpires?: Date | null;
}

const NoteSchema = new Schema<INote>({
  id: { type: String, default: () => crypto.randomUUID() },
  title: { type: String, required: true },
  tags: { type: [String], default: [] },
  content: { type: String, default: "" },
  lastEdited: { type: Date, default: Date.now },
  isArchived: { type: Boolean, default: false },
  isDummy: { type: Boolean, default: false },
});

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notes: { type: [NoteSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  resetCode: { type: String, default: null },
  resetCodeExpires: { type: Date, default: null },
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", userSchema);
