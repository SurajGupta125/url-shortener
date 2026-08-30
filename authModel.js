import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const client = new MongoClient(process.env.MONGODB_URI, {
    family: 4
})

const connect = await client.connect()

console.log('MongoDB Connected Successfully')

const db = connect.db(process.env.MONGODB_DATABASE_NAME)

export const collection = db.collection(
    process.env.MONGODB_AUTHENTICATION_COLLECTION
)

export const jwtSessionHybrid = db.collection(
    process.env.JWT_SESSION_HYBRID_AUTHENTICATION
)