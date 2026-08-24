import z from "zod";

export const validatePassword = z.object({

    // Current password
    currentPassword: z.string()
        .trim()
        .min(1, {
            message: "Current password is required"
        }),

    // New password
    newPassword: z.string()
        .trim()
        .min(6, {
            message: "Password must be at least 6 characters"
        })
        .max(20, {
            message: "Password must not exceed 20 characters"
        })
        .regex(/[A-Z]/, {
            message: "Password must contain at least one uppercase letter"
        })
        .regex(/[a-z]/, {
            message: "Password must contain at least one lowercase letter"
        })
        .regex(/[0-9]/, {
            message: "Password must contain at least one number"
        })
        .regex(/[!@#$%&*?]/, {
            message: "Password must contain at least one special character"
        }),

    // Confirm password
    confirmPassword: z.string()
        .trim()
        .min(1, {
            message: "Please confirm your password"
        })

}).refine((data) => data.newPassword === data.confirmPassword,
    {
        message: "New password and confirm password do not match",
        path: ["confirmPassword"]
    }
);