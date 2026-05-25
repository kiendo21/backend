import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();


const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
});

export const singleImageUpload = (fieldName = 'avatar') => upload.single(fieldName);

export const uploadBufferToCloudinary = async (file, options = {}) => {
    const { folder = 'base-express/avatars', public_id } = options;

    const base64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
        folder,
        public_id
    });

    return result.secure_url;
};

export default {
    singleImageUpload,
    uploadBufferToCloudinary
};
