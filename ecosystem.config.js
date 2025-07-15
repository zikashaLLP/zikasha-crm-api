module.exports = {
  apps: [
    {
      name: 'realestatecrm',
      script: 'server.js', // your main entry file
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
