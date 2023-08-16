const otherFunctions = require('./otherJsToRequire');

module.exports = (name) => {
    return otherFunctions.returnHelloWorldPersonalised(name);
}