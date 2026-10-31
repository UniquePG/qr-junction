module.exports = {
  apps: [
    {
      name: "qrjunction",
      cwd: "/home/deploy/qr-junction",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
