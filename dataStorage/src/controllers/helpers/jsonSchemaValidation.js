const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const ajv = new Ajv();
addFormats(ajv);

const validateJsonSchema = (schema, json) => {
    // console.log("----------------------------");
    // console.log(schema);
    // console.log("----------------------------");
    // console.log(json);
    try {
        const validate = ajv.compile(schema);
        const valid = validate(json);

        if (valid) {
            console.log("Valid!");
        } else {
            console.log("Invalid:", validate.errors);
        }
        return valid;
    } catch (e) {
        console.log('JSON VALIDATION --> (ERROR) : ', e);
        return false;
    }
}

function isValidJSON(jsonString) {
    try {
        JSON.parse(jsonString);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    validateJsonSchema,
    isValidJSON
}