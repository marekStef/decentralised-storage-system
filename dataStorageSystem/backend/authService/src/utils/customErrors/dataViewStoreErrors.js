class DataViewStoreServerNotRunningError extends Error {
    constructor(message = null) {
      super(message);
      this.name = 'DataViewStoreServerNotRunningError';
    }
}

module.exports = { DataViewStoreServerNotRunningError }