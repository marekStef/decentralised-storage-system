---
sidebar_position: 5
---

# Events Handling

:::caution

Before your app gets to handling of events, it needs to have `jwtTokenForPermissionRequestsAndProfiles` and `generatedAccessToken`. In fact, only `generatedAccessToken` is needed.

:::

## Events Uploading

**/app/api/uploadNewEvents** *(POST)*

## Modification of Event

- **/app/api/modifyEvent** *(PUT)*

## Deletion of Event

- **/app/api/deleteEvent** *(DELETE)*

## Fetching All Events For Given Access Token

- **/app/api/getAllEventsForGivenAccessToken** *(GET)*
