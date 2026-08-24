import z from 'zod'

//================ Edit Profile Name & Email Validate ===============

export const editProfileData = z.object({
    profile_name: z.string().trim().min(3, { message: "Name must be at least 3 character longer" }).
        max(100, { message: "Name must be no more then 100 character." }),

    profile_email: z.string().trim()
        .min(3, { message: "email must be at least 3 character longer." })
        .max(100, { message: "email must be no more then 100 character" })
        .email({ message: "Please enter a valid Email" }),
})
