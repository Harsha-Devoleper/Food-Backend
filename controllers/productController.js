const Product = require('../models/Product');
const Firm = require('../models/Firm');
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

const addProduct = async (req, res) => {
    try {
        const { productName, price, category, description, bestSeller } = req.body;

        const image = req.file ? req.file.path : null;

        const firmId = req.params.firmId;

        const firm = await Firm.findById(firmId);
        if (!firm) {
            return res.status(404).json({ error: "Firm not found" });
        }

        const product = new Product({
            productName,
            price,
            category,
            description,
            bestSeller,
            image,
            firm: firm._id
        });

        const savedProduct = await product.save();
        firm.products.push(savedProduct);
        await firm.save();

        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.log("Error adding product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const getProductByFirm = async (req, res) => {
    try {
        const firmId = req.params.firmId;

        const firm = await Firm.findById(firmId).populate('products');
        if (!firm) {
            return res.status(404).json({ error: "Firm not found" });
        }

        const restaurantName = firm.area;

        const products = await Product.find({ firm: firmId });

        res.status(200).json({ restaurantName, products });
    } catch (error) {
        console.log("Error fetching products by firm:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const deleteProductById = async (req, res) => {
    try {
        const productId = req.params.productId;

        const deletedProduct = await Product.findByIdAndDelete(productId);
        if (!deletedProduct) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.log("Error deleting product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    addProduct: [upload.single('image'), addProduct],
    getProductByFirm,
    deleteProductById
};
