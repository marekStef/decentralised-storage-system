---
sidebar_position: 5
---

# Events Handling

## Events Uploading

**/app/api/uploadNewEvents** *(POST)*

## Modification of Event

- **/app/api/modifyEvent** *(PUT)*

## Deletion of Event

- **/app/api/deleteEvent** *(DELETE)*

## Fetching All Events For Given Access Token

- **/app/api/getAllEventsForGivenAccessToken** *(GET)*

:::tip

If you wish to avoid overburdening the network with an excessively large data flow of events, you can create a `View` which the app will access through endpoint and this `View` will basically be your custom code running in the system and returning data it wants to return. To read an intro to views, head [here](/docs/intro/#) and to look at `View`s in more detail, head over [here](/docs/mainSystem/auth-service/)

:::