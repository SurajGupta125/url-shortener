import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";


// Environment variables load karne ke liye
dotenv.config();


// MongoDB client create karna
const client = new MongoClient(process.env.MONGODB_URI);


// MongoDB se connection banana
await client.connect();

console.log("✅ MongoDB Connected Successfully");


// Database select karna
const db = client.db(
    process.env.MONGODB_DATABASE_NAME
);


// Collection select karna
const collection = db.collection(
    process.env.MONGODB_COLLECTION_NAME
);



// =====================================
// Get All Links
// =====================================
// Database se saare short URLs fetch karega
// Example:
// [
//   {
//     url:"https://google.com",
//     shortCode:"abc123",
//     userId:"123"
//   }
// ]

export const loadLinks = async () => {

    return await collection
        .find()
        .toArray();

};





// =====================================
// Get User Specific Links
// =====================================
// Sirf login user ke links fetch karega
// Example:
// User A login karega to sirf User A ke URLs milenge

export const loadUserLinks = async (userId) => {

    return await collection
        .find({
            userId: userId
        })
        .toArray();

};





// =====================================
// Save New Short URL
// =====================================
// Naya URL database me save karega
//
// Data format:
// {
//    url:"https://google.com",
//    shortCode:"abc123",
//    userId:"user_id"
// }

export const saveLinks = async ({url,shortCode,userId}) => {


    return await collection.insertOne({url,shortCode,
 // Kis user ne URL create kiya
        userId,
        clicks: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
    });


};

//-------count clicks for user dashboard----------------
export const updateClicks = async (shortCode) => {

    return await collection.updateOne(
        { shortCode },
        {
            $inc: {
                clicks: 1
            }
        }
    );

};

//---------get total clicks for user dashboard----------------
export const getTotalClicks = async (userId) => {

    const links = await collection.find({ userId }).toArray();

    let totalClicks = 0;

    for (const link of links) {
        totalClicks += link.clicks || 0;
    }

    return totalClicks;
};

// =====================================
// Find Link By ShortCode
// =====================================
// Short URL open hone par database me
// shortCode search karega
//
// Example:
// /s/abc123
//
// abc123 ko find karega

export const getLinkByShortCode = async (
    shortCode
) => {


    return await collection.findOne({

        shortCode

    });


};

//---------delete ----------------

export const deleteData = async (id) => {
    return await collection.deleteOne({ _id: new ObjectId(id) })
}

//--------find data for popup edit-----------
export const getLinkBYId = async (id) => {
    return await collection.findOne({ _id: new ObjectId(id) })
}

///----------update Post----------
export const saveEditLinks = async (id,{ url, shortCode}) => {
    return await collection.updateOne({_id:new ObjectId(id)},{$set:{ url, shortCode, }})
}

//---------get links count for user dashboard----------------
export const getLinksCount = async (userId) => {

    return await collection.countDocuments({
        userId: userId
    });

};