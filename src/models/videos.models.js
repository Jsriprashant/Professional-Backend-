import mongoose from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
// chat gpt about this package

const videoSchema = new mongoose.Schema({
    videoFile: {
        type: String,
        required: true,

    },
    thumbnail: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    duration: {
        // we will get this from the cloudinary
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"

    }




}, { timestamps: true })

videoSchema.plugin(mongooseAggregatePaginate) //chat gpt---> why is this and what is this ---> something related to middle ware

export const Videos = mongoose.model("Videos", videoSchema)