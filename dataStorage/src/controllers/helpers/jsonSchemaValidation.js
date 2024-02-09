const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const draft7MetaSchema = require("ajv/dist/refs/json-schema-draft-07.json");
const ajv = new Ajv({
    allErrors: true,
    schemaId: "auto"
});
addFormats(ajv);
ajv.addMetaSchema(draft7MetaSchema);

const validateJsonSchema = (schema, json) => {
    console.log("----------------------------");
    console.log(schema);
    console.log("----------------------------");
    console.log(json);
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