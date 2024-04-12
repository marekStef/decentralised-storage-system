module.exports = {
    success: {
        EVENTS_CREATED_SUCCESSFULLY: "Events were created successfully",
        EVENT_UPDATED_SUCCESSFULLY: 'Event updated successfully.',
        EVENT_DELETED_SUCCESSFULLY: 'Event deleted successfully.',
        DUPLICATE: "Duplicate error"
    },
    error: {
        INVALID_CREATED_DATE_FORMAT_MUST_BE_ISO: 'Invalid createdDate format. It must be in ISO 8601 format',
        EVENT_NOT_CONTAINING_CORRECT_METADATA: 'Event does not contain correct metadata',
        MISSING_REQUIRED_FIELDS: "Some fields are missing",
        SERVER_ERROR_WHILE_FETCHING_EVENTS:  'Server error while fetching events',

        ERROR_DURING_UPDATE_OF_EVENT: 'An error occurred while updating the event.',
        ERROR_DURING_DELETE_OF_EVENT: 'An error occurred while deleting the event.',
        INVALILD_EVENT_ID_FORMAT: 'Invalid event ID format.',

        EVENT_NOT_FOUND: 'Event not found.'
    }
}