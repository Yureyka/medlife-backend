import mongoose, { Schema, Document } from "mongoose";
import isEmail from "validator/lib/isEmail";

export interface IOrder extends Document {
    type: string;
    fullname: string;
    phone: string;
    email: string;
    address: string;
    cart: Array<Object>;
    payment: string;
    delivery: string;
    comment: string;
    time: string;
    date: Date;
    status: string;
}

const OrderSchema = new Schema(
    {
        type: {
            type: String,
            enum: [
                "Вызов замерщика",
                "Заказ звонка",
                "Оформление заказа",
                "Подписка на рассылку"
            ],
            required: "Type is required"
        },
        fullname: String,
        phone: String,
        email: {
            type: String,
            validate: [isEmail, "Invalid email"]
        },
        address: String,
        cart: [
            {
                product: {
                    type: Schema.Types.ObjectId,
                    ref: "Product"
                },
                count: Number
            }
        ],
        payment: String,
        delivery: String,
        comment: String,
        time: String,
        date: Date,
        status: {
            type: String,
            default: "В обработке"
        }
    },
    {
        timestamps: true
    }
);

const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
