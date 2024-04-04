---
sidebar_position: 0
---

# Introduction

This component is responsible for managing **View Templates**. It heavily depends on the existence of other individual execution services as this component delegates work to them. 

The component's primary purpose is the focus on **View Instances** and **View Templates**. While most of the endpoints should be hidden from the public and should be used only internally by other running components of this system, endpoints for manipulating **View Templates** are open. **Auth Service** has no reasonable explanation for being put between the client and this component for it.

:::caution

Before you can utilise this component, you must understand the requirements on the source code. Therefore, you are obliged to read [this](./requirements-on-source-code) before continuing your reading of `View Manager` component.

:::

## Endpoints

`View Manager` has this set of endpoints:

### View Templates Related Endpoints *(for admin use only and public)*

- **/viewTemplates/createNewViewTemplate** *(POST)*
- **/viewTemplates/templates** *(GET)*
- **/viewTemplates/templates/:templateId** *(GET)*
- **/viewTemplates/deleteViewTemplate/:templateId** *(DELETE)*

### View Instances Related Endpoints *(for app use only and private, for the internal network only)*

- **/viewInstances/createNewViewInstance** *(POST)*
- **/viewInstances/runViewInstance** *(POST)*
- **/viewInstances/:viewInstanceId** *(GET)*