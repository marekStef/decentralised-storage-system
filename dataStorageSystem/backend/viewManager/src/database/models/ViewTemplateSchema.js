const mongoose = require('mongoose');

const ProfilePermissionSchema = require('./ProfilePermissionSchema');

const ViewTemplateMetadataSchema = new mongoose.Schema({
	runtime: {
		type: String,
		required: true
	},
}, {_id: false}); // _id is set to false so that Mongoose does not create an _id for the nested object

const ViewTemplateSchema = new mongoose.Schema({
	templateName: {
		type: String,
		required: true,
		unique: true
	},
	sourceCodeId: { // id for the uploaded code. this is because the uploaded code will be saved directly in the services so the view manager needs to know which code to call
		type: String,
		required: true
	},
	metadata: {
		type: ViewTemplateMetadataSchema,
		required: true
	},
	createdDate: {
		type: Date,
		default: Date.now
	},
	profiles: { // a list of needed profiles. When a ViewInstance is created, permissions for these profiles are created. Tokens to these profiles
		type: [ProfilePermissionSchema],
		required: true
	},
	// source: { // who registered this template (this should be a unique app name)
	// 	type: String
	// },
});

const ViewTemplate = mongoose.model('ViewTemplate', ViewTemplateSchema);

module.exports = {
	ViewTemplateMetadataSchema,
	ViewTemplate
};