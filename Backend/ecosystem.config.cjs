// ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "samyak-backend",
      script: "index.js",
      instances: "max", // use all CPU cores
      exec_mode: "cluster",
      listen_timeout: 8000,
      // PM2 sticky load-balancing for websockets/sessions
      sticky: true,
      env: {
        PORT: 5002,
        MONGODB_URI: "mongodb+srv://admin:vishnu%402005@cluster0.cnfu0ri.mongodb.net/samyak",
        JWT_SECRET: "surabhi2025",
        REDIS_PORT: 6379,
        REDIS_HOST: "localhost",
        FRONTEND_URL: "https://klsamyak.in",
        EMAIL_USER: "2300049219@kluniversity.in",
        EMAIL_PASSWORD: "Jeevan36@#$",
        // Disable internal clustering; PM2 handles it
        CLUSTER_ENABLED: "false"
      }
    },
    {
      name: "samyak-email-worker",
      script: "workers/emailWorker.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        REDIS_PORT: 6379,
        REDIS_HOST: "localhost"
      }
    }
  ]
};
  