import { z } from "zod";

const envSchema = z.object({
    PORT: z.coerce.number().min(1).max(65535).default(3000),

    MONGODB_URI: z.string().min(1),

    MONGODB_DATABASE_NAME: z.string().min(1),

    MONGODB_COLLECTION_NAME: z.string().min(1),

    MONGODB_AUTHENTICATION_COLLECTION: z.string().min(1),

    JWT_SECRET: z.string().min(1),

    SESSION_SECRET_CONNECT_FLASH: z.string().min(1),

    JWT_SESSION_HYBRID_AUTHENTICATION: z.string().min(1),

    EMAIL_USER: z.string().min(1, "Email Required is required"),

    EMAIL_PASS: z.string().min(1),

    CLOUDINARY_CLOUD_NAME: z.string({
        required_error: "Cloudinary cloud name is required"
    }).min(1, "Cloudinary cloud name is required"),

    CLOUDINARY_API_KEY: z.string({
        required_error: "Cloudinary API key is required"
    }).min(1, "Cloudinary API key is required"),

    CLOUDINARY_API_SECRET: z.string({
        required_error: "Cloudinary API secret is required"
    }).min(1, "Cloudinary API secret is required"),
});

const env = envSchema.parse(process.env);

export default env;