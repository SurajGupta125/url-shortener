import { collection, jwtSessionHybrid } from "./authModel.js";
import bcrypt from 'bcrypt'

import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, } from "./constants.js";

import { hashPassword, isPasswordCheck } from "./hashPass.js";

import { createAccessToken, createRefreshToken, createSession, } from "./jwtToken.js";

import { forgetUserEmail, forgetUserPassword, loginUserSchema, registerUserSchema, } from "./validateForm.js";

import { format, isToday, isYesterday } from "date-fns";

import { getLinksCount, getTotalClicks } from "./model.js";

import { sendVerificationEmail } from "./email.js";

import { editProfileData } from "./profile_data_validate.js";

import { validatePassword } from "./changePasswordValiadate.js";
import { ObjectId } from "mongodb";
import { sendResetVerificationEmail } from "./resetEmail.js";
import { upload } from "./config/multer.js";
import cloudinary from "./config/cloudenery.js";


// ================= Register Page =================

export const getRegister = (req, res) => {

    res.render("register", {
        user: null,
        errors: req.flash("errors")
    });

};



// ================= Login Page =================

export const getLogin = (req, res) => {

    res.render("login", {
        user: null,
        errors: req.flash("errors")
    });

};



// ================= Register User =================

export const postRegister = async (req, res) => {
    try {
        const result = registerUserSchema.safeParse(req.body);
        if (!result.success) {

            req.flash(
                "errors",
                result.error.issues[0].message
            );

            return res.redirect("/register");

        }
        const { name, email, password } = result.data;
        const existUser = await collection.findOne({ email });
        if (existUser) {

            req.flash(
                "errors",
                "User already exists"
            );

            return res.redirect("/register");

        }

        const hashedPassword = await hashPassword(password);

        const userRegister = await collection.insertOne({

            name,

            email,

            password: hashedPassword,

            createdAt: new Date(),

            updatedAt: new Date(),

            lastActive: new Date(),

            isEmailVerified: false,
        });


        console.log(userRegister);

        return res.redirect("/login");

    } catch (error) {

        console.log(error);

        res.status(500)
            .send(
                "Internal Server Error"
            );

    }

};

// ================= Login User =================

export const postLogin = async (req, res) => {

    try {


        const result =
            loginUserSchema.safeParse(req.body);



        if (!result.success) {

            req.flash(
                "errors",
                result.error.issues[0].message
            );

            return res.redirect("/login");

        }



        const {
            email,
            password
        } = result.data;




        const user = await collection.findOne({ email });

        if (!user) {
            req.flash(
                "errors",
                "Invalid Email or Password"
            );

            return res.redirect("/login");

        }
        const isMatch = await isPasswordCheck(password, user.password);
        if (!isMatch) {

            req.flash(
                "errors",
                "Invalid Email or Password"
            );

            return res.redirect("/login");

        }
        await collection.updateOne(
            {
                _id: user._id
            },
            {

                $set: {
                    lastActive: new Date()
                }

            }
        );
        const sessionId = await createSession({
            userId: user._id,

            ip: req.clientIp || req.ip,

            userAgent:
                req.headers["user-agent"]

        });






        const accessToken = createAccessToken({

            _id: user._id,

            name: user.name,

            email: user.email,

            sessionId
        });
        const refreshToken = createRefreshToken(sessionId);

        const cookieOptions = {

            httpOnly: true,

            secure: false,

            sameSite: "strict"

        };

        res.cookie(
            "access_token",
            accessToken,
            {
                ...cookieOptions,
                maxAge: ACCESS_TOKEN_EXPIRY
            }
        );

        res.cookie(
            "refresh_token",
            refreshToken,
            {
                ...cookieOptions,
                maxAge: REFRESH_TOKEN_EXPIRY
            }
        );

        return res.redirect("/");
    } catch (error) {

        console.log(error);

        res.status(500)
            .send(
                "Internal Server Error"
            );
    }

};
// ================= Logout =================

export const logoutUser = async (req, res) => {
    try {
        if (req.user?.sessionId) {
            await jwtSessionHybrid.updateOne(
                {
                    _id: req.user.sessionId
                },
                {
                    $set: {
                        valid: false,
                        updatedAt: new Date()
                    }
                }
            );
        }
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");

        return res.redirect("/login");

    } catch (error) {
        console.log(error);
        return res.redirect("/login");
    }

};
// ================= About =================

export const about = (req, res) => {

    res.render(
        "about",
        {
            user: req.user
        }
    );

};
// ================= Profile =================

export const profile = async (req, res) => {


    const last =
        new Date(
            req.user.lastActive
        );


    let lastActive;



    if (isToday(last)) {

        lastActive = "Today";

    }
    else if (isYesterday(last)) {

        lastActive = "Yesterday";

    }
    else {

        lastActive = format(last, "dd MMM yyyy");

    }
    const linksCreated = await getLinksCount(req.user._id);
    const totalClicks = await getTotalClicks(req.user._id);
    res.render(
        "profile",
        {
            user: req.user,
            lastActive,
            linksCreated,
            totalClicks
        }
    );


};

// ================= Send Verification Email =================
export const getEmailVerificationPage = async (req, res) => {

    try {

        const user = await collection.findOne({
            _id: req.user._id
        });

        if (!user) {
            return res.redirect("/login");
        }

        return res.render("emailVerification", {
            user,
            success: req.flash("success"),
            errors: req.flash("errors")
        });

    } catch (error) {

        console.log(error);

        return res.status(500).send("Internal Server Error");

    }

};
export const emailVerification = async (req, res) => {

    try {

        const user = await collection.findOne({
            _id: req.user._id
        });

        if (!user) {
            return res.redirect("/login");
        }

        if (user.isEmailVerified) {

            req.flash("success", "Email already verified");

            return res.redirect("/profile");
        }

        const verificationCode = emailVerificationCode();

        await collection.updateOne(
            {
                _id: user._id
            },
            {
                $set: {
                    verificationCode,
                    verificationCodeExpire: new Date(
                        Date.now() + 10 * 60 * 1000
                    )
                }
            }
        );

        await sendVerificationEmail(
            user.email,
            verificationCode
        );

        console.log("OTP Sent: emailVerification click", verificationCode);

        req.flash(
            "success",
            "Verification code sent successfully"
        );

        return res.redirect("/email-verification");

    } catch (error) {

        console.log(error);

        return res.status(500).send("Internal Server Error");

    }

};

export const verifyEmail = async (req, res) => {

    try {

        const { verificationCode } = req.body;

        const user = await collection.findOne({
            _id: req.user._id
        });

        if (!user) {
            return res.redirect("/login");
        }

        if (user.verificationCode !== verificationCode) {
            req.flash("errors", "Invalid Verification Code");
            return res.redirect("/email-verification");
        }

        if (new Date() > new Date(user.verificationCodeExpire)) {
            req.flash("errors", "Verification Code Expired");
            return res.redirect("/email-verification");
        }

        await collection.updateOne(
            { _id: user._id },
            {
                $set: {
                    isEmailVerified: true
                },
                $unset: {
                    verificationCode: "",
                    verificationCodeExpire: ""
                }
            }
        );

        req.flash("success", "Email Verified Successfully");

        return res.redirect("/profile");

    } catch (error) {

        console.log(error);

        return res.status(500).send("Internal Server Error");

    }

};
// ================= Generate OTP =================

const emailVerificationCode = () => {

    return Math.floor(
        100000 +
        Math.random() * 900000
    ).toString();

};

//==================== Edit Profile ================

export const editUserProfile = async (req, res) => {
    const user = await collection.findOne({
        _id: req.user._id
    });
    console.log(user, "edit-profile")
    res.render("edit-profile", {
        user: req.user,
        errors: req.flash("errors"),
        success: req.flash("success")
    });
}

//==================== POST Edit Profile ================

export const postUserProfile = async (req, res) => {
    try {
        const userUpadtedData = editProfileData.safeParse(req.body)
        console.log(userUpadtedData)
        if (!userUpadtedData.success) {
            req.flash(
                "errors",
                userUpadtedData.error.issues[0].message
            )
            return res.redirect('/edit-profile')
        }
        const { profile_name, profile_email } = userUpadtedData.data //new data of user
        const user = await collection.findOne({ _id: req.user._id })
        console.log('by edit profile', user) //exist user find
        if (!user) {
            res.redirect("/login")
        }
        if (user.email !== profile_email) {

            await collection.updateOne(
                { _id: req.user._id },
                {
                    $set: {
                        name: profile_name,
                        email: profile_email,
                        updatedAt: new Date(),
                        isEmailVerified: false
                    }
                }
            );

        } else {

            await collection.updateOne(
                { _id: req.user._id },
                {
                    $set: {
                        name: profile_name,
                        email: profile_email,
                        updatedAt: new Date()
                    }
                }
            );

        }
        res.redirect('/profile')
    } catch (error) {
        console.log(error)
        res.status(500).send("Internal Server Error")
    }
}

//================= Change Password ==================

export const changePassword = (req, res) => {
    res.render('change-password', {
        user: req.user,
        errors: req.flash("errors")
    })
}

//================= Post Change Password ==================

export const newPass = async (req, res) => {
    try {
        const getNewPass = validatePassword.safeParse(req.body)
        console.log(getNewPass)
        if (!getNewPass.success) {
            req.flash(
                "errors",
                getNewPass.error.issues[0].message
            );
            return res.redirect("/change-password");
        }

        const { currentPassword, newPassword, confirmPassword } = getNewPass.data
        console.log(currentPassword, newPassword, confirmPassword)

        const userId = req.user._id
        console.log("find exist user", userId)

        const findUser = await collection.findOne({ _id: userId })
        console.log('find user ', findUser)


        if (!findUser.password) {

            return res.render("change-password", {
                user: req.user,
                errors: [
                    "You signed in with Google. You don't have a current password."
                ]
            });

        }

        const isPasswordCheckCorrect = await bcrypt.compare(
            currentPassword,
            findUser.password
        );

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            findUser.password
        );
        console.log("Password correct:", isPasswordCorrect);

        if (!isPasswordCorrect) {
            return res.render('change-password', {
                user: req.user,
                errors: ["Current password is incorrect."]
            })
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10)
        console.log(hashedNewPassword)

        const addNewPassword = await collection.updateOne(
            {
                _id: new ObjectId(userId)
            },
            {
                $set: {
                    password: hashedNewPassword,
                    updatedAt: new Date()
                }
            }
        )

        console.log("Change User Password in Database", addNewPassword)

        res.redirect('/login')

    } catch (error) {
        console.log(error)
        res.status(500).send("Internal server error")
    }
}

//============ Upload User Profile Image =============

export const uploadProfilePicture = async (req, res) => {
    try {
        const user = await collection.findOne({_id: req.user._id})
        if (!user) {
            return res.redirect('/login')
        }
        if (!req.file) {
            return res.status(400).send('Please select an image')
        }

        const result = await new Promise((resolve, reject) => {

            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'profile_pictures'
                },
                (error, result) => {

                    if (error) {
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }
            )

            stream.end(req.file.buffer)
        })

        await collection.updateOne(
            {
                _id: req.user._id
            },
            {
                $set: {
                    profileImage: result.secure_url
                }
            }
        )

        res.redirect('/profile')

    } catch (err) {

        console.log(err)
        res.status(500).send('Image upload failed')

    }
}

//=================== forget Password ==================

export const forgetPassword = (req, res) => {
    res.render("forget-password", {
        errors: req.flash("errors")
    })
}

//=================== forget Password ==================

export const checkRegisterdEmail = async (req, res) => {
    const validateRegisterEmail = forgetUserEmail.safeParse(req.body)
    console.log("validateRegisterEmail", validateRegisterEmail)

    if (!validateRegisterEmail.success) {
        req.flash(
            "errors",
            validateRegisterEmail.error.issues[0].message
        )
        return res.redirect("/forget-password");
    }

    const { registerEmail } = validateRegisterEmail.data

    const findUserEmail = await collection.findOne({ email: registerEmail })
    console.log("findUserEmail", findUserEmail)

    if (!findUserEmail) {
        return res.render('forget-password', {
            errors: ["Email Not Found"]
        })
    }

    const generateOTP = emailVerificationCode();
    console.log("generateOTP", generateOTP)

    const storeOTP = await collection.updateOne(
        {
            _id: findUserEmail._id
        },
        {
            $set: {
                verificationCode: generateOTP,
                verificationCodeExpire: new Date(Date.now() + 2 * 60 * 1000)
            }
        }
    )
    console.log("storeOTP in data", storeOTP)

    await sendResetVerificationEmail(
        findUserEmail.email,
        generateOTP,
        findUserEmail.name
    )
    console.log("OTP sent successfully");

    return res.redirect("/verify-OTP")
}

//=================== Verify OTP ==================
export const verifyOTP = async (req, res) => {

    const user = await collection.findOne({
        verificationCode: { $exists: true },
        verificationCodeExpire: { $exists: true }
    });

    if (!user) {
        return res.render("verify-OTP", {
            errors: ["OTP not found"],
            expiryTime: null
        });
    }

    return res.render("verify-OTP", {
        errors: req.flash("errors"),
        expiryTime: user.verificationCodeExpire
    });
};

//=================== Verify OTP ==================
export const forgetOTPRECIVE = async (req, res) => {

    const {
        otp1,
        otp2,
        otp3,
        otp4,
        otp5,
        otp6
    } = req.body;

    const data =
        otp1 +
        otp2 +
        otp3 +
        otp4 +
        otp5 +
        otp6;


    // OTP find
    const matchotp = await collection.findOne({
        verificationCode: data
    });


    // OTP wrong
    if (!matchotp) {
        return res.render("verify-OTP", {
            errors: ["Invalid OTP"],
            expiryTime: null
        });
    }


    // Current time
    const currentTime = new Date();


    // OTP expired
    if (currentTime > matchotp.verificationCodeExpire) {

        return res.render("verify-OTP", {
            errors: ["OTP Expired"],
            expiryTime: matchotp.verificationCodeExpire
        });

    }
    // OTP correct and valid
    return res.redirect("/reset-password");
};

//=================== Reset Password ==================

export const resetPassword = (req, res) => {
    res.render("reset-password", {
        errors: req.flash("errors")
    })
}

//=================== Reset Password ==================

export const resetOldPassword = async (req, res, matchotp) => {
    try {
        const newUserData = forgetUserPassword.safeParse(req.body)
        console.log("newUserData", newUserData)

        if (!newUserData.success) {
            req.flash(
                "errors",
                newUserData.error.issues[0].message
            )
            return res.redirect('/reset-password')
        }
        const { newpassword, confpassword } = newUserData.data

        const findforgetUser = await collection.findOne({ matchotp })
        console.log("findforgetUser", findforgetUser)

        console.log("newpassword", newpassword)

        console.log("findforgetUser id:", findforgetUser._id)

        const hashNewPassword = await bcrypt.hash(newpassword, 10)

        console.log("hashNewPassword", hashNewPassword)

        await collection.updateOne(
            {
                _id: findforgetUser._id
            },
            {
                $set: {
                    password: hashNewPassword
                }
            }
        )
        res.redirect("/login")

    } catch (error) {
        console.error(error)
        res.status(500).send("Internal server error")
    }
}




