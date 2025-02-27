const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const draft7MetaSchema = require("ajv/dist/refs/json-schema-draft-07.json");
const ajv = new Ajv({
    allErrors: true,
    schemaId: "auto"
});
addFormats(ajv);
ajv.addMetaSchema(draft7MetaSchema);

/**
 * Validates a JSON object against a given JSON schema.
 *
 * This function uses AJV (Another JSON Schema Validator) to compile and validate the JSON object
 * against the provided schema.
 *
 * @param {Object} schema - The JSON schema to validate against.
 * @param {Object} json - The JSON object to be validated.
 * @returns {boolean} `true` if the JSON object is valid against the schema, `false` otherwise.
 */
const validateJsonSchema = (schema, json) => {
    console.log("schema: [json validation] ----------------------------");
    console.log(schema);
    console.log("json: [json validation] ----------------------------");
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

function isValidJSON(json) {
    try {
        JSON.stringify(json);
        return true;
    } catch (error) {
        return false;
    }
}

module.exports = {
    validateJsonSchema,
    isValidJSON
}