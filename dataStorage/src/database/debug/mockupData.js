const ApplicationSchema = require('../models/applicationRelatedModels/ApplicationSchema');
const ProfileSchema = require('../models/eventRelatedModels/EventProfileSchema');
const EventSchema = require('../models/eventRelatedModels/EventSchema');

const db = require('../Database')
db.connect();

console.log("HEEERE");


const newApplication = new ApplicationSchema({
    nameDefinedByUser: 'My phone location tracker',
    nameDefinedByApp: 'LocationTrackerApp.com',
});

newApplication.save()
    .then(app => console.log('Application saved:', app))
    .catch(err => console.error('Error saving application:', err));

const newProfile = new ProfileSchema({
    name: 'LocationTrackerApp.com/profile/profile1',
    metadata: {
        createdDate: new Date(),
        profile: "app:core",
        sourceAppName: "LocationTrackerApp.com"
    },
    schema: JSON.stringify({
        "$schema": "https://json-schema.org/draft/2019-09/schema",
        "type": "object",
        "properties": {
            "payload": {
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
                "required": ["latitude", "longitude"],
                "additionalProperties": false
            }
        },
        "required": ["payload"],
        "additionalProperties": false
    })
});


newProfile.save()
    .then(profile => console.log('Profile saved:', profile))
    .catch(err => console.error('Error saving profile:', err));

    const newEvent = new EventSchema({
        metadata: {
          identifier: "0000-0002",
          createdDate: new Date("2023-10-21T21:44:10"),
          profile: "LocationTrackerApp.com/profile/profile1",
          source: "LocationTrackerApp.com",
          acceptedDate: new Date("2023-10-21T21:44:20"),
        },
        payload: JSON.stringify({
          latitude: 50.08804,
          longitude: 14.42076
        })
      });
      
      newEvent.save()
        .then(event => console.log('Event saved:', event))
        .catch(err => console.error('Error saving event:', err));