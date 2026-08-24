import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";

import { collection, jwtSessionHybrid } from "./authModel.js";

import {
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY,
    MILLISECONDS_PER_SECOND
} from "./constants.js";


dotenv.config();


// ================= CREATE SESSION =================

export const createSession = async ({
    userId,
    ip,
    userAgent
}) => {

    const result =
        await jwtSessionHybrid.insertOne({

            userId: new ObjectId(userId),

            ip,

            userAgent,

            valid: true,

            createdAt: new Date(),

            updatedAt: new Date()

        });


    console.log(
        "Created Session ID:",
        result.insertedId
    );


    return result.insertedId;

};



// ================= CREATE ACCESS TOKEN =================

export const createAccessToken = (user) => {


    const token =
        jwt.sign(

            {
                _id: String(user._id),

                name: user.name,

                email: user.email,

                sessionId:
                    String(user.sessionId)

            },

            process.env.JWT_SECRET,

            {
                expiresIn:
                    ACCESS_TOKEN_EXPIRY /
                    MILLISECONDS_PER_SECOND
            }

        );


    return token;

};



// ================= CREATE REFRESH TOKEN =================

export const createRefreshToken = (sessionId) => {


    if (!sessionId) {

        throw new Error(
            "Session ID missing"
        );

    }


    const token =
        jwt.sign(

            {
                sessionId:
                    String(sessionId)
            },

            process.env.JWT_SECRET,

            {
                expiresIn:
                    REFRESH_TOKEN_EXPIRY /
                    MILLISECONDS_PER_SECOND
            }

        );


    return token;

};



// ================= VERIFY JWT =================

export const verifyJwtToken = (token) => {

    return jwt.verify(
        token,
        process.env.JWT_SECRET
    );

};



// ================= FIND USER =================

export const findUserById = async (userId) => {


    try {


        console.log(
            "Searching User ID:",
            userId
        );


        if (!userId) {

            return null;

        }


        const user =
            await collection.findOne({

                _id: new ObjectId(userId)

            });



        console.log(
            "Found User:",
            user
        );


        return user;



    } catch (error) {


        console.log(
            "Find User Error:",
            error.message
        );


        return null;

    }

};



// ================= FIND SESSION =================

export const findSessionById = async (sessionId) => {


    try {


        console.log(
            "Searching Session ID:",
            sessionId
        );


        if (!sessionId) {

            return null;

        }



        const session =
            await jwtSessionHybrid.findOne({

                _id:
                    new ObjectId(sessionId)

            });



        console.log(
            "Found Session:",
            session
        );


        return session;



    } catch (error) {


        console.log(
            "Find Session Error:",
            error.message
        );


        return null;

    }


};



// ================= INVALIDATE SESSION =================

export const invalidateSession = async (sessionId) => {


    await jwtSessionHybrid.updateOne(

        {
            _id:
                new ObjectId(sessionId)
        },

        {

            $set: {

                valid: false,

                updatedAt: new Date()

            }

        }

    );


    console.log(
        "Session Invalidated"
    );

};



// ================= GENERATE NEW TOKENS =================

export const generateNewTokens = async (refreshToken) => {
    console.log("========== GENERATE NEW TOKENS ==========");
    const decoded = verifyJwtToken(refreshToken);
    console.log("Decoded Refresh Token:", decoded);
    const session = await findSessionById(decoded.sessionId);



    if (!session) {
        throw new Error("Session not found");
    }
    console.log("Session Valid:", session.valid);
    if (!session.valid) {
        throw new Error("Session expired");
    }
    const user = await findUserById(session.userId);



    if (!user) {


        await invalidateSession(
            session._id
        );


        throw new Error(
            "User not found"
        );

    }




    const tokenPayload = {


        _id:
            user._id.toString(),


        name:
            user.name,


        email:
            user.email,


        sessionId:
            session._id.toString()

    };



    console.log(
        "Token Payload:",
        tokenPayload
    );




    const newAccessToken =
        createAccessToken(
            tokenPayload
        );


    const newRefreshToken =
        createRefreshToken(
            session._id
        );



    console.log(
        "New Tokens Created"
    );



    return {


        user,

        newAccessToken,

        newRefreshToken

    };


};



// ================= AUTH MIDDLEWARE =================

export const verifyAuthentication = async (
    req,
    res,
    next
) => {


    req.user = null;

    res.locals.user = null;



    const accessToken =
        req.cookies.access_token;


    const refreshToken =
        req.cookies.refresh_token;



    console.log(
        "Access Token:",
        !!accessToken
    );


    console.log(
        "Refresh Token:",
        !!refreshToken
    );



    // ===== ACCESS TOKEN =====


    if (accessToken) {


        try {


            const payload =
                verifyJwtToken(
                    accessToken
                );


            console.log(
                "Access Payload:",
                payload
            );



            const user =
                await findUserById(
                    payload._id
                );



            if (!user) {

                throw new Error(
                    "User not found"
                );

            }



            req.user = user;

            res.locals.user = user;



            return next();



        } catch (error) {


            console.log(
                "Access Token Error:",
                error.message
            );


        }

    }





    // ===== NO REFRESH TOKEN =====


    if (!refreshToken) {


        console.log(
            "No Refresh Token"
        );


        res.clearCookie(
            "access_token"
        );


        res.clearCookie(
            "refresh_token"
        );


        return res.redirect(
            "/login"
        );

    }




    // ===== REFRESH TOKEN =====


    try {


        const data =
            await generateNewTokens(
                refreshToken
            );



        req.user =
            data.user;



        res.locals.user =
            data.user;



        res.cookie(
            "access_token",
            data.newAccessToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: ACCESS_TOKEN_EXPIRY
            }
        );
        res.cookie(
            "refresh_token",
            data.newRefreshToken,
            {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: REFRESH_TOKEN_EXPIRY
            }
        );
        console.log("Refresh Token Success");
        return next();
    } catch (error) {
        console.log("Refresh Token Error:", error.message);
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
        return res.redirect("/login");
    }
};