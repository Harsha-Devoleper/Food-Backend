const Firm = require('../models/Firm');
const Vendor = require('../models/Vendor');
const multer = require('multer');


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
        console.log("a");


        const vendor = await Vendor.findById(req.vendorId);
        console.log("b");
        if (!vendor) {
            return res.status(404).json({ error: "Vendor not found" });
        }
        console.log("c");
        const firm = new Firm({
            firmName,
            area,
            category,
            region,
            offer,
            image,
            vendor: vendor._id
        });
        console.log("Before saving:", firm);
        console.log("1");
        const savedFirm = await firm.save();
        console.log("2");
        vendor.firm.push(savedFirm);
        console.log("3");
        await vendor.save();
        console.log("4");

        res.status(201).json({ message: 'Firm added successfully' });
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
