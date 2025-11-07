const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const sKey = process.env.name

const vendorRegister = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const vendorEmail = await Vendor.findOne({ email });
        if (vendorEmail) {
            return res.status(400).send('Email already in use');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newVendor = new Vendor({ username, email, password: hashedPassword });
        await newVendor.save();
        res.status(201).json({ message: 'Vendor registered successfully' });
        console.log('Vendor registered successfully');
    } catch (error) {
        res.status(400).json({ error: "Internal Server Error" });
    }
};

const vendorLogin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(404).send('Vendor not found');
        }
        const isMatch = await bcrypt.compare(password, vendor.password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ vendorId: vendor._id }, sKey, { expiresIn: '1h' });

        const vendorId = vendor._id;

        res.status(200).json({ message: 'Login successful', token, vendorId });
        console.log(email, "this is token: ", token);
    } catch (error) {
        res.status(400).json({ error: "Internal Server Error" });
    }
};

const getAllVendors = async (req, res) => {
    try {
        const vendors = await Vendor.find().populate('firm');
        res.json({ vendors });
    } catch (error) {
        console.log("Error fetching vendors:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getVendorById = async (req, res) => {
    try {
        const vendorId = req.params.id;
        const vendor = await Vendor.findById(vendorId).populate('firm');
        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }
        const vendorFirmId = vendor.firm[0]._id;
        res.status(200).json({ vendorId, vendorFirmId, vendor });
        console.log(vendorFirmId);
    } catch (error) {
        console.log("Error fetching vendor:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    vendorRegister,
    vendorLogin,
    getAllVendors,
    getVendorById
};
