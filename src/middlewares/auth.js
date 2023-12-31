//===================== Importing Module and Packages =====================//
const JWT = require('jsonwebtoken');

const db = require('../db');

//<<<===================== This function used for Authentication =====================>>>//
const Authentication = async (req, res, next) => {
    try {

        //===================== Check Presence of Key with Value in Header =====================//
        let token = req.headers['authorization'];

        if (!token) { return res.status(400).send({ status: false, message: "Token must be Present." }) }
        token = token.slice(7)
        //===================== Verify token & asigning it's value in request body =====================//
        JWT.verify(token, "unitylabs-task-backend", function (error, decodedToken) {
            if (error) {
                return res.status(401).send({ status: false, message: "Invalid Token." })
            } else {
                req.token = decodedToken
                next()
            }
        })

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}

//<<<=====================This function used for Authorisation(Phase II)=====================>>>//

const Authorization = async (req, res, next) => {

    try {

        //===================== Authorising with userId From Param =====================//

        let usertype = req.token.payload.usertype;

        let userId = req.token.payload.userId;

        if (usertype !== 'seller') return res.status(403).send({ status: false, message: "You are not authorised" })

        const getUserIdQuery = `SELECT id FROM seller WHERE id = ?`

        //===================== Fetching All User Data from DB =====================//

        const [result] = await db.promise().query(getUserIdQuery, [userId]);

        if (result.length == 0) return res.status(403).send({ status: false, message: "Unauthorized User Access!" })

        next()

    } catch (error) {

        res.status(500).send({ status: false, error: error.message })
    }
}

//================================= Module Export ==============================================//

module.exports = { Authentication, Authorization }