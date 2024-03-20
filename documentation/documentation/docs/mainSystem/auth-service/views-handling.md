---
sidebar_position: 6
---

# Views Handling

:::note

`View Templates` and `View Instances` are trully being handled by `View Manager` component. `Auth Service` only checks whether the app is authorised to use given `View Instance` and then delegates this request to `View Manager` component. To know more about it, head there, please.

Therefore, it's called `View Access` in `Auth Service`.

:::

## Registering New View Instance

- **/app/api/registerNewViewInstance** *(POST)*

```js title=""
```

## Running View Instance

- **/app/api/runViewInstance** *(POST)*

```js title=""
```

## Getting All View Accesses

:::note
As mentioned above, `View Access` is just an access to the `View Instance`. `View Instances` are being managed by `View Manager`.
:::

---

Congratulations! You have now covered most of the `Auth Service` component functionality! 🎉🎉🎉