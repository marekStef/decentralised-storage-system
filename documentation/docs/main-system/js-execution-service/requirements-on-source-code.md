---
sidebar_position: 1
---

# Requirements On Source Code

There are multiple requirements regarding the code structure as well as the files as well.

### Javascript Files Only

All files uploaded need to be valid javascript files with `.js` ending.

### Importing of Other Files

You can upload up to 10 javascript files which can import one another. However, a javascript file can import another using `require` keyword only, like the following:

```js title="Source Code Require Example"
const { getResponseMessage } = require('./second');
```

:::caution

Your code won't work if you use `import` instead of `require` as the code is being run on `node js` server!

:::

### One Main File Requirement

As mentioned [before](#importing-of-other-files) you can import multiple files **but exactly one of them must be called `main.js`**.

If none of the files will be called `main.js`, `Javascript Execution Service` won't accept such source code.

### Exporting Exactly One Function From Main File

In addition to the necessity of one file needed to be called `main.js`, this file needs to export exactly one function using the following syntax:

```js title="Example of exporting exactly one function from main.js"
const helloWorld = async parametersObject => {
    const {accessTokensToProfiles, configuration, clientCustomData} = parametersObject;
}

module.exports = helloWorld;
```

### Main Export Function from Main file parameter requirement

Exported function from the `main.js` file needs to have exactly one parameter of type `object`. This object is bound to be passed and it's ensured the parameter won't be `null`.