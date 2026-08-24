import { z } from "zod";

export const urlShortenerValidate = z.object({
    url: z.string()
        .trim()
        .url({ message: "Please enter a valid URL." })
        .max(1024, { message: "URL can't be longer than 1024 characters." }),

    shortCode: z.string()
        .trim()
        .min(3, { message: "Short code must be at least 3 characters." })
        .max(50, { message: "Short code can't be longer than 50 characters." })
        .optional()
        .or(z.literal(""))
});

export const postEditurl = z.object({
    url: z.string().trim().url({ message: "Please enter a valid URL." })
        .max(1024, { message: "URL can't be longer then 1024 character." }),

    shortCode: z.string().trim()
        .min(3, { message: "Short code must be at least 3 character." })
        .max(50, { message: "Sort code can't be longer more than 50 character." })
        .optional().or(z.literal(""))
})