import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const client  = new MongoClient(process.env.MONGODB_URI)

const connect = await client.connect()

const db  = connect.db(process.env.MONGODB_DATABASE_NAME)

 export const collection = db.collection(process.env.MONGODB_AUTHENTICATION_COLLECTION)

 export const jwtSessionHybrid = db.collection(process.env.JWT_SESSION_HYBRID_AUTHENTICATION)

