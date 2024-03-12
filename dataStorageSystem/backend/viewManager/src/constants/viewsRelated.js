const allowedRuntimes = [
    'javascript',
    'python'
]

const isAllowedRuntime = runtime => {
    return allowedRuntimes.includes(runtime);
}

module.exports = {
    allowedRuntimes,
    isAllowedRuntime
}