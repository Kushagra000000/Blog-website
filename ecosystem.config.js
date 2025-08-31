module.exports = {
  apps: [{
    name: "kushagra-blog",
    script: "app.js",
    cwd: "/Users/kushagra/Desktop/Nodejs-Blog--self-host",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    env_production: {
      NODE_ENV: "production",
      PORT: 3000,
      ADMIN_HASH: "some hash here",
      //not yet implemented the hash function
      SESSION_SECRET: "passwrod"
    }
  }]
};
