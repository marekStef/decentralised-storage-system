---
sidebar_position: 0
---

# Introduction

This component is responsible for managing `View Templates`. It heavily depends on the existence of other individual execution services as this component delegates work to them. 

:::caution

Before you can utilise this component, you must understand the requirements on the source code. Therefore, you are obliged to read [this](./requirements-on-source-code) before continuing your reading of `View Manager` component.

:::

## Endpoints

`View Manager` has this set of endpoints:

### View Templates Related Endpoints *(for admin use only)*

- **/viewTemplates/createNewViewTemplate** *(POST)*
- **/viewTemplates/templates** *(GET)*
- **/viewTemplates/templates/:templateId** *(GET)*
- **/viewTemplates/deleteViewTemplate/:templateId** *(DELETE)*

### View Instances Related Endpoints *(for app use only)*

- **/viewInstances/createNewViewInstance** *(POST)*
- **/viewInstances/runViewInstance** *(POST)*
- **/viewInstances/:viewInstanceId** *(GET)*