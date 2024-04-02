---
sidebar_position: 0
---

# Introduction

This component is the heart of the whole system. It allows any general event to be stored as long as the event contains `payload` and `metadata`. In the `metadata` object, `profile` and `source` needs to be set (it can be seen from the schema). These two fields will be checked when saving the event, otherwise anything else can be put both in the `metadata` and `payload`.

Any component having access to this component can do anything with the data. Therefore, access to this component cannot be directly provided to users' apps, unless you don't want any form of authentication / authorisation. That's why `Auth Service` is put between a user (client 3rd party app) to authenticate and authorise any actions it comes across.

## Endpoints

### Events Related 
`EventsRoutes.js`

It allows these operations as of now:

- **/app/api/uploadNewEvents** *(POST)*

- **/app/api/getFilteredEvents** *(POST)*

- **/app/api/events/:eventId** *(PUT)*

- **/app/api/events/:eventId** *(DELETE)*

### Status Related
`statusInfoRoutes.js`

- **/status_info/checks/check_data_storage_presence** *(GET)*

The current functionality of **Data Storage** component has been intentionally designed to be minimalistic, prioritizing a high level of generality. This design choice ensures that it can serve as a *foundational building block*. By focusing on a core set of features and not adding other non-critical ones, we give other runtime components (current as well as future ones) in the system the freedom to utilize this component in ways that best suit their needs.

This approach also ensures that the component remains *lightweight*, facilitating ease of potential future expansions. The simplicity of the component's current capabilities does not limit its potential; rather, it lays the groundwork for a scalable system that can evolve over time. As new requirements emerge (from other runtime components in the system) or as the ecosystem around it grows (new 3rd party apps requirements or whole new concepts being added in), additional functionalities can be seamlessly integrated.

In this way, the minimalist design of this component is not a reflection of its limitations but a strategic decision to maximize its adaptability and utility across a wide range of applications. This ensures that as the system evolves, the **Data Storage** component can be enhanced, making it a versatile and valuable asset in the architecture of the system.

--- 

To know more about the schemas of the event and about the interfaces of the endpoints, continue with your reading, please. 