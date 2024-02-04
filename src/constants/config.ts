import dotEnv from "dotenv";

dotEnv.config();

const env = process.env;

export default {
    PORT: env.SERVER_PORT as string,
    MONGO_DB_URI: env.MONGO_DB_URI as string,
    MONGO_DB_NAME: env.MONGO_DB_NAME as string,
    NODEMAILER_USER: env.NODEMAILER_USER as string,
    NODEMAILER_PASSWORD: env.NODEMAILER_PASSWORD as string,
    JWT_ACCESS_TOKEN_KEY: env.JWT_ACCESS_TOKEN_KEY as string,
    JWT_REFRESH_TOKEN_KEY: env.JWT_REFRESH_TOKEN_KEY as string,
} as const;
