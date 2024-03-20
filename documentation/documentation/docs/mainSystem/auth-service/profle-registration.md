---
sidebar_position: 3
---

# Profile Registration

After your app is set up and has `jwtTokenForPermissionRequestsAndProfiles` correctly saved, it can proceed to create `profile`.

Before proceeding, please read about profiles [here in introduction](/docs/mainSystem/intro#profile)

## When to create a profile?

Now it's time to ask yourself a question about whether your app is about to produce its own unique data or not.

If not, you can skip creating a profile and go to Permissions.

## Profile registration

You are here because your app has been developed to produce its own data. Before it can start saving that data in this system, it first needs to tell this system something about it.

To create a new profile, a request to **/app/api/registerNewProfile** *(POST)* needs to be made.

This is what the body of the request needs to look like:

```js title="body of registerNewProfile request"
{
    "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY1ZmFlMDk0N2E5MGI0YTUyNjNhNDk4MCIsIm5hbWVEZWZpbmVkQnlVc2VyIjoiTXkgTmV3IEFwcGxpY2F0aW9uIiwibmFtZURlZmluZWRCeUFwcCI6ImFwcGxpY2F0aW9uLmNvbSIsImlhdCI6MTcxMDk0MDcxMywiZXhwIjoxMTE3ODIyMDcxM30.3zHTC0_igQKfzjF8uZadJLkmd4qRXY_hePd_M6pmPj0",
    "metadata": {
        "createdDate": "2024-02-08T21:56:18.277Z",
        "profile": "core:profile-registration_v1"
    },
    "payload": {
        "profile_name": "application.com/first_profile",
        "json_schema": {
            "type": "object",
            "properties": {
                "latitude": {
                    "type": "number",
                    "minimum": -90,
                    "maximum": 90
                },
                "longitude": {
                    "type": "number",
                    "minimum": -180,
                    "maximum": 180
                }
            },
            "required": [
                "latitude",
                "longitude"
            ],
            "additionalProperties": false
        }
    }
}
```

There are multiple kinds of resposnes:

- request is successfull

```js title="201 (created) response"
{
    "message": "Profile registered successfully"
}
```

- profile with a given name already exists but the content of json schema is the same
```js title="201 (created) response (profile name uniquness broken but pardoned due to the json schema being same)"
{
    "message": "Profile registered successfully",
    "code": "ALREADY_EXISING_WITH_SAME_SCHEMA"
}
```

As you can see, additional `code` has been returned but this can be ignored.

- profile with a given name already exists and json schemas differ from each other (this cannot be resolved and manual intervention is needed)

```js title="different json schema with the same name as above"
{
    "jwtTokenForPermissionRequestsAndProfiles": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6IjY1ZmFlMDk0N2E5MGI0YTUyNjNhNDk4MCIsIm5hbWVEZWZpbmVkQnlVc2VyIjoiTXkgTmV3IEFwcGxpY2F0aW9uIiwibmFtZURlZmluZWRCeUFwcCI6ImFwcGxpY2F0aW9uLmNvbSIsImlhdCI6MTcxMDk0MDcxMywiZXhwIjoxMTE3ODIyMDcxM30.3zHTC0_igQKfzjF8uZadJLkmd4qRXY_hePd_M6pmPj0",
    "metadata": {
        "createdDate": "2024-02-08T21:56:18.277Z",
        "profile": "core:profile-registration_v1"
    },
    "payload": {
        "profile_name": "application.com/first_profile",
        "json_schema": {
            "type": "object",
            "properties": {
                "differentKey": {
                    "type": "object"
                }
            },
            "required": [
                "differentKey"
            ],
            "additionalProperties": false
        }
    }
}
```

```js title="400 (bad request)"
{
    "message": "Profile name must be unique"
}
```

- something missing in the request

For instance this request lacks jwt token:

```js title="bad request example"
{
    "metadata": {
        "createdDate": "2024-02-08T21:56:18.277Z",
        "profile": "core:profile-registration_v1"
    },
    "payload": {
        "profile_name": "application.com/first_profile",
        "json_schema": {
            "type": "object",
            "properties": {
                "latitude": {
                    "type": "number",
                    "minimum": -90,
                    "maximum": 90
                },
                "longitude": {
                    "type": "number",
                    "minimum": -180,
                    "maximum": 180
                }
            },
            "required": [
                "latitude",
                "longitude"
            ],
            "additionalProperties": false
        }
    }
}
```

```js title="400 (bad request)"
{
    "message": "Missing required fields"
}
```

- invalid jwt token

```js title="400 (bad request)"
{
    "message": "Invalid or expired JWT token"
}
```

---

Congratulations! Your app has now its own profile registered in the system! 🎉🎉🎉

:::caution

You might suppose your app now has all permissions to this profile but that is not the case! Next step for your app is to request permissions for that profile as if it was a profile created by another app.

:::
