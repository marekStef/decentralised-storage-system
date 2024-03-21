---
sidebar_position: 3
---

# Code Execution

For code exectuion, `Javascript Execution Service` has the following endpoint:

### **/executeSourceCode/:sourceCodeId** *(POST)*

- `sourceCodeId` is the id obtained when registering a source code
- body needs to contain the following:

```js title="Example body of the executeSourceCode request"
{
    "parametersForMainEntry": {"marek": "hey"}
}
```

`parametersForMainEntry` must be object and this requirement is being proactively checked. `parametersForMainEntry` is the only object which will be passed to the entry function of the source code. 

:::info

To read more about which entry function it is and how the source code needs to look, head over [here](./requirements-on-source-code).

:::

There are multiple kinds of responses:

- source code successfully executed

```js title="response - 200"
{
    "message": 'Code execution result', 
    "result": // anything your entry function returns
}
```

- syntax error in the source code

```js title="400 - bad request"
{ 
    "message": 'There is a syntax error. Code could not be loaded'
}
```

- source code does not exist

```js title="400 - bad request"
{ 
    message: 'Given source code does not exist' 
}
```