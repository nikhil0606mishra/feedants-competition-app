import { Schema, model, HydratedDocument } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export type UserDoc = HydratedDocument<IUser>;

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true, // unique index doubles as our login/lookup index
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    phone: { type: String, trim: true, match: [/^\+?[0-9]{10,15}$/, 'Invalid phone number'] },
    avatarUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
