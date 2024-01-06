import { Db, MongoClient } from "mongodb";

export default abstract class MongoDBService {
    private static readonly MONGO_DB_URI: string = process.env.MONGO_DB_URI!;
    private static readonly MONGO_DB_NAME: string = process.env.MONGO_DB_NAME!;
    private static _db: Db = null!;
    private static _client: MongoClient = null!;

    private static async init() {
        MongoDBService._client = await MongoClient.connect(MongoDBService.MONGO_DB_URI);
        MongoDBService._db = MongoDBService._client.db(MongoDBService.MONGO_DB_NAME);
    }

    public static async getDB() {
        if (!MongoDBService._db) {
            await MongoDBService.init();
        }
        return MongoDBService._db;
    }

    public static async getSession() {
        if (!MongoDBService._client) {
            await MongoDBService.init();
        }
        return MongoDBService._client.startSession();
    }
}