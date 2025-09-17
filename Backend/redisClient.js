import Redis from "ioredis";

const redisClient = new Redis({
  port: process.env.REDIS_PORT || 6379,
  host: process.env.REDIS_HOST || "localhost",
});

redisClient.on("connect", () => console.log("Connected to Redis"));
redisClient.on("error", (err) => console.error("Redis Client Error:", err));

export default redisClient;
