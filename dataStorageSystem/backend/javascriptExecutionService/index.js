const express = require('express');
const app = express();
const port = 10001;

app.use(express.json());

const JS_EXECUTION_SERVICE_URL_MESSAGE = 'JS_EXECUTION_SERVICE_URL_MESSAGE';

app.post('/execute', (req, res) => {
    console.log('Executing code with parameters:', req.body);
    res.send('Code execution result');
});

app.listen(port, () => {
    console.log(`JavascriptExecutionService listening at http://localhost:${port}`);
    if (process && process.send) {
        process.send({type: JS_EXECUTION_SERVICE_URL_MESSAGE, url: `http://localhost:${port}`});
    }
});
