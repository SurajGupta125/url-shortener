import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import { collection } from "../authModel.js";

dotenv.config();


// ==================================================
// GOOGLE STRATEGY
// ==================================================

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,

            clientSecret: process.env.GOOGLE_CLIENT_SECRET,

            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },

        async (accessToken, refreshToken, profile, done) => {

            try {

                const email = profile.emails?.[0]?.value;

                // 1. MongoDB me user search
                const existingUser = await collection.findOne({
                    email: email
                });

                console.log("Existing Google User:", existingUser);


                // 2. User already exists
                if (existingUser) {

                    console.log("Google User already exists");

                    return done(null, existingUser);
                }


                // 3. New Google user
                const newUser = {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: email,
                    profileImage: profile.photos?.[0]?.value,

                    isEmailVerified: true,

                    createdAt: new Date(),
                    updatedAt: new Date(),
                    lastActive: new Date()
                };


                // 4. MongoDB me insert
                const result = await collection.insertOne(newUser);

                console.log(
                    "New Google User Created:",
                    result.insertedId
                );


                // 5. Passport ko user return
                const createdUser = {
                    ...newUser,
                    _id: result.insertedId
                };

                return done(null, createdUser);

            } catch (error) {

                console.error("Google authentication error:", error);

                return done(error, null);
            }
        }
    )
);


// ==================================================
// SERIALIZE USER
// ==================================================

passport.serializeUser((user, done) => {

    done(null, user);

});


// ==================================================
// DESERIALIZE USER
// ==================================================

passport.deserializeUser((user, done) => {

    done(null, user);

});


export default passport;