import cluster from 'cluster';
import os from 'os';
import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
dotenv.config();
import userRoutes from "./routes/user.routes.js";
import connectDB from "./database/db.js";
import adminRoutes from "./routes/admin.routes.js";
import eventRoutes from "./routes/event.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
const app = express();

app.use(cors({
  origin: '*',

}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/uploads", express.static("uploads"));


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});


const startServer = async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Worker ${process.pid} listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

const enableClustering = process.env.CLUSTER_ENABLED === 'true';
const numWorkers = Number(process.env.WEB_CONCURRENCY) || os.cpus().length;

if (enableClustering && cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running with ${numWorkers} workers`);
  for (let i = 0; i < numWorkers; i += 1) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.warn(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  startServer();
}

export default app;
