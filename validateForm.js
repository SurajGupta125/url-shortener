import z from 'zod'

//================= Register form Validate ==========

export const registerUserSchema = z.object({
    name: z.string().trim().min(3, { message: "Name must be at least 3 character longer" })
        .max(100, { message: "Name must be no more then 100 character" }),

    email: z.string().trim().email({ message: "please enter valid email address" })
        .min(3, { message: "email must be at least 3 character longer." })
        .max(100, { message: "email must be no more then 100 character" }).toLowerCase(),

    password: z
        .string()
        .trim()
        .min(6, { message: "Password must be at least 6 characters long." })
        .max(20, { message: "Password must not exceed 20 characters." })
        .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter."
        })
        .regex(/[a-z]/, {
            message: "Password must contain at least one lowercase letter."
        })
        .regex(/[0-9]/, {
            message: "Password must contain at least one number."
        })
        .regex(/[@$!%*?&]/, {
            message: "Password must contain at least one special character."
        })
})

//============ Login form Validated ===============

export const loginUserSchema = z.object({

    email: z.string()
        .trim()
        .email({
            message: "Please enter valid email address"
        })
        .max(100, {
            message: "Email must not exceed 100 characters"
        })
        .toLowerCase(),

    password: z.string()
        .trim()
        .min(1, {
            message: "Password is required"
        })

});

//================== forget Password Email Validate ================

export const forgetUserEmail = z.object({
    registerEmail: z.string().trim().email({ message: "Please enter a valid email address" })
        .min(3, { message: "Email must be at least 3 character longer." })
        .max(100, { message: "Email must be no more then 100 character" })
        .toLowerCase()
})

//================== Reset New Password =============

export const forgetUserPassword = z.object({
    newpassword: z
        .string()
        .trim()
        .min(6, { message: "Password must be at least 6 characters long." })
        .max(20, { message: "Password must not exceed 20 characters." })
        .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter."
        })
        .regex(/[a-z]/, {
            message: "Password must contain at least one lowercase letter."
        })
        .regex(/[0-9]/, {
            message: "Password must contain at least one number."
        })
        .regex(/[@$#!%*?&]/, {
            message: "Password must contain at least one special character."
        }),

    confpassword: z.string()

}).refine((data) => data.newpassword === data.confpassword, {
    message: "New forget password and confirm password don't match",
    path: ["confpassword"]
})