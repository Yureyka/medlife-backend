import mongoose, { Schema, Document } from "mongoose";
import isEmail from "validator/lib/isEmail";
import { generatePasswordHash } from "../utils";

export interface IUser extends Document {
  login: string;
  password: string;
  admin: boolean;
}

const UserSchema = new Schema(
  {
    login: {
      unique: true,
      type: String,
      default: false,
      required: "Login is required",
    },
    password: {
      type: String,
      required: "Password is required",
    },
    admin: {
      type: Boolean,
      required: "Role is required",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const user: any = this;

  if (!user.isModified("password")) {
    return next();
  }

  user.password = await generatePasswordHash(user.password);
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  // @ts-ignore
  const user: any = this._update;

  if (!user.$set.password) {
    return next();
  }

  user.$set.password = await generatePasswordHash(user.$set.password);
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
