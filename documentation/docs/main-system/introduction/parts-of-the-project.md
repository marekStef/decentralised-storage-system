---
sidebar_position: 0
---

# Parts of the project

The project is divided into mostly two parts: 
- Main Storage System for handling and processing of data
- Fully-fledged example apps highlighting the possibilities of the main system

## Main System for handling and processing of data

Main system consists of multiple individual runtime components:
- Data Storage
- Auth Service
- View Manager
- Javascript Execution Service
- Python Execution Service

These components communicate on their own private network created by a docker and only `Auth Service` and part of `View Manager` is open for outside world requests.

## Fully-fledged Example Apps

Each demo app is thoroughly described in the module [Apps](../../example-apps/intro)

### Location Tracker
Android app (kotlin, java). This app lets the user to set up when and how to gather the user's location data and the app then goes into background mode quietly gathering information.

### Windows Activity Tracker
C++ Windows desktop app. This app gathers data around what the user is currently doing on their PC.

### Calendar app
Desktop browser app (React, tsx). This app is a fully working calendar app. Apart from doing a normal calendar job, the app processes locations gathered by `Location Tracker` app and also displays a history of opened Windows apps.

## New Developer of a New App?

If you are thinking of creating a new app utilising this system's capabilities for its core business functionality, all you need to read is **Auth Service** and **View Manager**. You can definitely skip **Data Storage** and **\[language\] execution services**. 

Definitely have a look at those provided example apps. We wish you a successful journey!