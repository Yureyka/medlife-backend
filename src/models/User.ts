import mongoose, { Schema, Document } from "mongoose";
import isEmail from "validator/lib/isEmail";
import { generatePasswordHash } from "../utils";

export interface IUser extends Document {
    admin: Boolean;
    fullname: string;
    phone: string;
    email: string;
    password: string;
    address: string;
    orders: Array<Object>;
}

const UserSchema = new Schema(
    {
        admin: {
            type: Boolean,
            default: false
        },
        fullname: String,
        phone: String,
        email: {
            type: String,
            unique: true,
            required: "Email address is required!",
            validate: [isEmail, "Invalid email"]
        },
        password: {
            type: String,
            required: "Password is required"
        },
        address: String,
        orders: [
            {
                type: Schema.Types.ObjectId,
                ref: "Order"
            }
        ]
    },
    {
        timestamps: true
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
