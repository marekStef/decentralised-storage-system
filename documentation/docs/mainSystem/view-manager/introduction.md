---
sidebar_position: 0
---

# Introduction

:::caution

Before you can utilise this component, you must understand the requirements on the source code. Therefore, you are obliged to read [this](./requirements-on-source-code) before continuing your reading of `View Manager` component.

:::

## Endpoints

`View Manager` has this set of endpoints:

### View Templates Related Endpoints

- **/viewTemplates/createNewViewTemplate** *(POST)*
- **/viewTemplates/templates** *(GET)*
- **/viewTemplates/templates/:templateId** *(GET)*
- **/viewTemplates/deleteViewTemplate/:templateId** *(DELETE)*

### View Instances Related Endpoints

- **/viewInstances/createNewViewInstance** *(POST)*
- **/viewInstances/runViewInstance** *(POST)*
- **/viewInstances/:viewInstanceId** *(GET)*