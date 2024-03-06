const appName = "CalendarPro.com";
const calendarEventProfileName = `${appName}_CalendarEventProfile`;
const permissonsObjectForCalendarEventPermissionRequest = {
    profile: calendarEventProfileName,
    read: true,
    create: true,
    modify: true,
    delete: true,
};

export default {
    appName,
    calendarEventProfileName,
    permissonsObjectForCalendarEventPermissionRequest,

    DATA_STORAGE_ROOT_PROFILE: "core:profile-registration_v1",
};
