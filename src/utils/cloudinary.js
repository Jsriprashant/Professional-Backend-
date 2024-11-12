import { v2 as cloudinary } from "cloudinary"
import { apiError } from "../utils/apiError.js"
import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {

    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // in response cloudinary gives the link to the photos or videous

        console.log("uploaded files sucessfully", response.url)
        // console.log("this is the total response", response)
        fs.unlinkSync(localFilePath) // Unlink (delete) the file only after successful upload
        return response


    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved  file as the upload operation got failed
    }

}

const deleteOnCloudinary = async (deleteFileUrl) => {
    try {
        if (!deleteFileUrl) {
            return null;
        }
    // http://res.cloudinary.com/dtd8amomx/image/upload/v1729346079/egi0fnfz2cws0raekvio.png

    //["http:", "", "res.cloudinary.com", "dtd8amomx", "image", "upload", "v1729346079", "egi0fnfz2cws0raekvio.png"] 

    // [egi0fnfz2cws0raekvio,png]
        const publicId = deleteFileUrl.split('/').pop().split('.')[0];
        
        const response = await cloudinary.uploader.destroy(publicId, { resource_type: "image" })
      

        return response;


    } catch (error) {
        throw new apiError(400, error?.message || "Something went wrong while deleting file")
    }
}


export { uploadOnCloudinary, deleteOnCloudinary }

