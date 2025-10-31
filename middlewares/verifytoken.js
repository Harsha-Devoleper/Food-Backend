const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const sKey = process.env.name

const verifyToken = async(req, res, next) => {
    const token = req.headers.token;

    if (!token) {
        return res.status(401).json({error: "Token is required"});
    }
    try {
        const decoded  = jwt.verify(token, sKey)
        const vendor = await Vendor.findById(decoded.vendorId);
        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        req.vendorId = vendor._id;
        next();
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }

   
};

module.exports = verifyToken;
