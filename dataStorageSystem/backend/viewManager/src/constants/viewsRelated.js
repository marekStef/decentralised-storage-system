const allowedRuntimes = [
    'javascript',
    'python'
]

const runtimeUrlMapping = {
    javascript: process.env.JAVASCRIPT_EXECUTION_SERVICE_URI,
    python: process.env.PYTHON_EXECUTION_SERVICE_URI
};

const getExecutionServiceUrlBasedOnSelectedRuntime = runtime => {
    return runtimeUrlMapping[runtime] || null;
}

const isAllowedRuntime = runtime => {
    return allowedRuntimes.includes(runtime);
}

module.exports = {
    allowedRuntimes,
    isAllowedRuntime,
    getExecutionServiceUrlBasedOnSelectedRuntime
}