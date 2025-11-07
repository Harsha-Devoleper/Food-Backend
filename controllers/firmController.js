const Firm = require('../models/Firm');
const Vendor = require('../models/Vendor');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

const addFirm = async (req, res) => {
    try {

        const { firmName, area, category, region, offer } = req.body;
        console.log(firmName, area, category, region, offer);
        const image = req.file ? req.file.path : null;

        const vendor = await Vendor.findById(req.vendorId);
        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }

        if (vendor.firm.length > 0) {
            return res.status(400).json({ message: "Vendor can add only one firm" });
        }

        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id
        });
        
        const savedFirm = await firm.save();
        const firmmId = savedFirm._id;
        vendor.firm.push(savedFirm);
        await vendor.save();

        res.status(201).json({ message: 'Firm added successfully', firmmId });
    } catch (error) {
        console.log("Error adding firm:", error);
        res.status(500).json({ error: "Internal server error" });
        
    }
};

const deleteFirmById = async (req, res) => {
    try {
        const firmId = req.params.firmId;
        const deletedFirm = await Firm.findByIdAndDelete(firmId);
        if (!deletedFirm) {
            return res.status(404).json({ error: "Firm not found" });
        }
        res.status(200).json({ message: "Firm deleted successfully" });
    } catch (error) {
        console.log("Error deleting firm:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    addFirm: [upload.single('image'), addFirm],
    deleteFirmById
};
