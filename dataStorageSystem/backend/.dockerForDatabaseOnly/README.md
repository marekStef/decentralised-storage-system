# Important

This `dockerForDatabaseOnly` is not currently used. That's because the main data storage system does not utilise MongoDB transactions ( the code using it has been commeented out and replaced ).

In order for transactions to work, we needed to have this Docker Compose file setting up a single MongoDB container with a replica set configuration. But as already said, it's left here just as a legacy for possible future use.