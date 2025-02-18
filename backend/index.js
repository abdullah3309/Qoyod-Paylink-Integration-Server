const express = require("express");
const cors = require("cors");
const { Sequelize } = require("sequelize");
const paymentRoutes = require("./routes/payment");
const dashboardRoutes = require("./routes/dashboard");

// Initialize Express app
const app = express();

const corsOptions = {
  origin: '*', // Allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies and authorization headers
};

app.use(cors(corsOptions));
app.use(express.json());

// Database Connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

// Test database connection
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

// Routes
app.use("/payment", paymentRoutes(express));
app.use("/dashboard", dashboardRoutes(express));

// Default route
app.get("/", (req, res) => {
  res.send("Paylink-Qoyod Integration Backend is running!");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});