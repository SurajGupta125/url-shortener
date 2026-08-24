import crypto from "crypto";

import {
    saveLinks,
    loadUserLinks,
    getLinkByShortCode,
    deleteData,
    getLinkBYId,
    saveEditLinks,
    updateClicks,
} from "./model.js";

import { postEditurl, urlShortenerValidate } from "./url-shortener-validate.js";
import { ObjectId } from "mongodb";
import { collection } from "./authModel.js";

// =====================================
// Home Page
// =====================================
// Login user ke sirf uske links show karega
// =====================================
export const getShortenerPage = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect("/login");
        }

        // User ke links
        const links = await loadUserLinks(req.user._id);

        // Host
        const host = `${req.protocol}://${req.get("host")}`;

        return res.render("index", {
            user: req.user,
            links,
            host,
            errors: req.flash("errors"),
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
};

// =====================================
// Create Short URL
// =====================================
// User naya short URL create karega
// Aur database me userId ke sath save hoga
// =====================================

export const postURLShortener = async (req, res) => {

    try {


        // const {
        //     url,
        //     shortCode
        // } = req.body;

        const urlShortner = urlShortenerValidate.safeParse(req.body)

        if (!urlShortner.success) {
            req.flash(
                "errors",
                urlShortner.error.issues[0].message
            );

            return res.redirect("/");
        }

        const { url, shortCode } = urlShortner.data

        // Agar user custom shortCode nahi deta
        // to random code generate hoga
        const finalShortCode =
            shortCode?.trim() ||
            crypto.randomBytes(4)
                .toString("hex");




        // Check karo shortCode already exist hai ya nahi
        const existingLink =
            await getLinkByShortCode(
                finalShortCode
            );



        if (existingLink) {

            req.flash(
                "errors",
                "Short Code already exists"
            );

            return res.redirect("/");
        }




        // Database me URL save karo
        // userId ke sath
        await saveLinks({

            url,


            shortCode: finalShortCode,


            // Login user ki ID
            userId: req.user._id

        });




        // Home page par redirect
        res.redirect("/");



    } catch (error) {

        console.log(error);

        res.status(500)
            .send("Internal Server Error");

    }

};





// =====================================
// Redirect Short URL
// =====================================
// Example:
// localhost:7000/s/abc123
//
// abc123 ko find karke original URL par bhejega
// =====================================

export const redirectToShortLink = async (req, res) => {
    try {

        const { shortCode } = req.params;

        // Short code search karo
        const link = await getLinkByShortCode(shortCode);

        if (!link) {
            return res
                .status(404)
                .send("Short URL not found");
        }

        // Click count +1
        await updateClicks(shortCode);

        // Original URL par redirect
        res.redirect(link.url);

    } catch (error) {

        console.log(error);

        res.status(500).send("Internal Server Error");

    }
};

export const deleteLink = async (req, res) => {

    try {

        const { id } = req.params;

        await deleteData(id);

        res.redirect("/");

    } catch (error) {

        console.log(error);
        res.status(500).send("Internal Server Error");

    }

};

export const getEditPage = async (req, res) => {
    const updateId = req.params.id
    const link = await getLinkBYId(updateId)
    res.render('edit', { link, user: req.user })
}

export const postEditPage = async (req, res) => {
    const id = req.params.id
    const savePostUrl = postEditurl.safeParse(req.body)
    if (!savePostUrl.success) {
        req.flash("errors", savePostUrl.error.issues[0].message)
        return res.redirect("/")
    }
    const { url, shortCode, } = savePostUrl.data
    await saveEditLinks(id, { url, shortCode })
    res.redirect('/')
}
