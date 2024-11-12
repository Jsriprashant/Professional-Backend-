import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema({
    subscriber: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
            // one who is subscribing
        }
    ,
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
        // one to whom 'subscriber' is subscribing
    }


}, { timeStamp: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)