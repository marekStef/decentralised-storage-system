const ApplicationSchema = require('../ApplicationSchema');
const ProfileSchema = require('../EventProfileSchema');
const EventSchema = require('../EventSchema');

const db = require('../../Database')
db.connect();

console.log("HEEERE");


const newApplication = new ApplicationSchema({
    name: 'Location Tracker App',
    internalIdentifier: 'LTApp001',
});

newApplication.save()
    .then(app => console.log('Application saved:', app))
    .catch(err => console.error('Error saving application:', err));


const newProfile = new ProfileSchema({
    appId: newApplication._id, // Use the actual application ID from your database
    name: 'Location Data',
    schema: {
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
    }
});


newProfile.save()
    .then(profile => console.log('Profile saved:', profile))
    .catch(err => console.error('Error saving profile:', err));

    const newEvent = new EventSchema({
        appId: newApplication._id, // Use the application ID
        profileId: newProfile._id, // Use the profile ID you just created
        metadata: {
          identifier: "0000-0002",
          createdDate: new Date("2023-10-21T21:44:10"),
          profile: "Location Data",
          source: "position-application-collector",
          acceptedDate: new Date("2023-10-21T21:44:20"),
        },
        payload: {
          latitude: 50.08804,
          longitude: 14.42076
        }
      });
      
      newEvent.save()
        .then(event => console.log('Event saved:', event))
        .catch(err => console.error('Error saving event:', err));