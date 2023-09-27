# Sequence for Data View Tranformation Templates

1. App can register a new `Data View Transformation Template`. This template is associated with the creator app and cannot be used by any other app. When creating such a template, app needs to provide event type (by its id), javascript files, main file name ( entry file name) and main entry function name in entry file name. Each main entry function when invoked will receive a temporary url access to the servers events data.
2. App can create an instance of an already created `Data View Transformation Template`. 
   `Data View Transformation Template Instance` needs to know which specific events (`DataEventsSource` field of `Data View Transformation Template Instance`) it has access to (Selected based on `CreatedTime` of a data event)
   App will designate a range by giving `oldestEventTimestamp` and `newestEventTimestamp`
3. App will get token to such new data template instance
4. App can choose to put it on `Data Storage Cloud Hub`, in which case it will get publicly accessible access token url which can be sent to someone
5. `Data Storage System's` user interface shows the user all currently active instances and information about them ( whether they are shared over `Data Storage Clud Hub` or their expiration time)
6. User can cancel such `Data View Transformation Template Instance` in `Data Storage System`