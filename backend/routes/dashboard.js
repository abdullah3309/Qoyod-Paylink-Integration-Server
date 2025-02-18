const { Product, SyncLog } = require("../models");
const { Op } = require("sequelize");
const teacherController = require('./teacher');

const dashboardRoutes = (express) => {
  const dash_router = express.Router();

  //========================PRODUCT CRUD ROUTES============================

  // GET all products for the dashboard
  dash_router.get("/products", async (req, res) => {
    try {
      const products = await Product.findAll();
      res.json({ success: true, products: products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET a single product by ID
  dash_router.get("/products/:id", async (req, res) => {
    try {
      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found!" });
      }
      res.json({ success: true, product });
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST to create a new product
  dash_router.post("/products", async (req, res) => {
    try {
      const product = await Product.create(req.body);
      res.status(201).json({ success: true, product });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(400).json({ success: false, error: error.message });
    }
  });

  // PUT to update an existing product
  dash_router.put("/products/:id", async (req, res) => {
    try {
      const [updated] = await Product.update(req.body, {
        where: { id: req.params.id },
      });
      if (updated) {
        const updatedProduct = await Product.findByPk(req.params.id);
        return res.json({ success: true, product: updatedProduct });
      }
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE a product
  dash_router.delete("/products/:id", async (req, res) => {
    try {
      const deleted = await Product.destroy({
        where: { id: req.params.id },
      });
      if (deleted) {
        return res.status(204).send();
      }
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });


  //========================TEACHER CRUD ROUTES============================ 
  // Teacher routes
  dash_router.get('/teachers', teacherController.getAllTeachers);
  dash_router.post('/teachers', teacherController.createTeacher);
  dash_router.put('/teachers/:id', teacherController.updateTeacher);
  dash_router.delete('/teachers/:id', teacherController.deleteTeacher);




  //==========================LOGS ROUTE=========================
  // Get all sync logs with filters
  dash_router.get("/logs", async (req, res) => {
    try {
      const {
        type,
        startDate,
        endDate,
        errorCode,
        page = 1,
        limit = 50,
      } = req.query;

      const where = {};

      if (type) where.entityType = type;
      if (errorCode) where.errorCode = errorCode;

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[Op.gte] = new Date(startDate);
        if (endDate) where.timestamp[Op.lte] = new Date(endDate);
      }

      const logs = await SyncLog.findAndCountAll({
        where,
        order: [["timestamp", "DESC"]],
        limit: parseInt(limit),
        offset: (page - 1) * limit,
      });

      res.json({
        success: true,
        total: logs.count,
        logs: logs.rows,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return dash_router;
}

module.exports = dashboardRoutes;