import express from "express";

import {
    deleteLink,
    getEditPage,
    getShortenerPage,
    postEditPage,
    postURLShortener,
    redirectToShortLink,
} from "./controllers.js";


import {
    verifyAuthentication
} from "./jwtToken.js";


const router = express.Router();



// Protected Home
router.get(
    "/",
    verifyAuthentication,
    getShortenerPage
);



router.post(
    "/",
    verifyAuthentication,
    postURLShortener
);




router.post('/delete/:id', deleteLink)

router.get('/edit/:id',verifyAuthentication, getEditPage)

router.post('/edit/:id', postEditPage)

// Public Short URL
router.get("/:shortCode",redirectToShortLink)


export default router;