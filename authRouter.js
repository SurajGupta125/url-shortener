import express from "express";

import {
    getLogin,
    getRegister,
    postRegister,
    postLogin,
    logoutUser,
    about,
    profile,
    getEmailVerificationPage,
    emailVerification,
    verifyEmail,
    editUserProfile,
    postUserProfile,
    changePassword,
    newPass,
    forgetPassword,
    verifyOTP,
    resetPassword,
    checkRegisterdEmail,
    forgetOTPRECIVE,
    resetOldPassword
} from "./authController.js";

import {
    verifyAuthentication,
    createSession,
    createAccessToken,
    createRefreshToken
} from "./jwtToken.js";

import {
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_EXPIRY
} from "./constants.js";

// import { verifyAuthentication } from "./jwtToken.js";
import passport from "passport";

const router = express.Router();

// ================= Register =================

router.get("/register", getRegister);
router.post("/register", postRegister);

// ================= Login =================

router.get("/login", getLogin);
router.post("/login", postLogin);

// ================= Protected Routes =================

router.get("/about", verifyAuthentication, about);

router.get("/profile", verifyAuthentication, profile);

// ================= Email Verification =================

router.get(
    "/email-verification",
    verifyAuthentication,
    getEmailVerificationPage
);

router.post(
    "/send-verification-code",
    verifyAuthentication,
    emailVerification
);

router.post(
    "/verify-email",
    verifyAuthentication,
    verifyEmail
);

//============ Edit Profile =================

router.get('/edit-profile', verifyAuthentication, editUserProfile)

//============ Post Edit Profile =================

router.post('/edit-profile', verifyAuthentication, postUserProfile)

//============ Change Password =================

router.get('/change-password', verifyAuthentication, changePassword)

//============== Post Change Password ===========

router.post('/change-password', verifyAuthentication, newPass)

//============== forget Password ===========

router.get('/forget-password', forgetPassword)

//============== forget Password ===========

router.post('/forget-password', checkRegisterdEmail)

//============== GET verify OTP ================

router.get('/verify-otp', verifyOTP)

//============== verify OTP ================

router.post('/verify-otp', forgetOTPRECIVE)

//============== Reset Password =============

router.get('/reset-password', resetPassword)

//============== Reset Password =============

router.post('/reset-password', resetOldPassword)

//============== Continue with Google =============

router.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "consent"
    })
);

//============== Continue with Google Callback =============

router.get(
    "/auth/google/callback",

    passport.authenticate("google", {
        failureRedirect: "/login",
        session: false
    }),

    async (req, res) => {

        try {
            const user = req.user;
            console.log("Google User:", user);
            // ===============================
            // CREATE SESSION
            // ===============================
            const sessionId = await createSession({
                userId: user._id,
                ip: req.clientIp,
                userAgent: req.headers["user-agent"]
            });
            console.log("Google Session ID:", sessionId);
            // ===============================
            // CREATE ACCESS TOKEN
            // ===============================
            const accessToken = createAccessToken({
                ...user,
                sessionId
            });
            console.log("Access Token:", !!accessToken);
            // ===============================
            // CREATE REFRESH TOKEN
            // ===============================
            const refreshToken = createRefreshToken(sessionId);
            console.log("Refresh Token:", !!refreshToken);
            // ===============================
            // ACCESS TOKEN COOKIE
            // ===============================
            res.cookie("access_token",
                accessToken,
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: ACCESS_TOKEN_EXPIRY
                }
            );
            // ===============================
            // REFRESH TOKEN COOKIE
            // ===============================
            res.cookie("refresh_token",
                refreshToken,
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                    maxAge: REFRESH_TOKEN_EXPIRY
                }
            );
            console.log("Google Login Successful");
            // ===============================
            // REDIRECT
            // ===============================
            return res.redirect("/profile");
        } catch (error) {
            console.error("Google Login Error:", error);
            return res.redirect("/login");
        }
    }
);

// ================= Logout =================
router.get("/logout", logoutUser);

export default router;