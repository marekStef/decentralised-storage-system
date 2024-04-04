---
sidebar_position: 0
---

# Introduction

`Javascript Execution Service` is intended to be used by `View Manager` component to execute custom defined javascript source code. It has been designed as a general code execution component and does not feature any `View Manager`'s related logic. This allows the component to be used by future newly added concepts in the system.

:::caution

Before you can utilise this component, you must understand the requirements on the source code. Therefore, you are obliged to read [this](./requirements-on-source-code) before continuing your reading of `Javascript Execution Service`.

:::

## Endpoints

### Code Registration Related

- **/uploadNewSourceCode** *(POST)*
- **/sourceCodes/:sourceCodeId** *(GET)*
- **/sourceCodes/:sourceCodeId** *(DELETE)*

### Code Execution Related

- **/executeSourceCode/:sourceCodeId** *(POST)*