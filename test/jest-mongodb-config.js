module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '3.5.7',
      skipMD5: true
    },
    autoStart: false,
    instance: {
      dbName: 'jest'
    }
  }
};
