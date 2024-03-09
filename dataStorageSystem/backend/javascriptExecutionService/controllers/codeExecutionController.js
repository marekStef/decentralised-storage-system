const executeSourceCode = (req, res) => {
    console.log('Executing code with parameters:', req.body);
    res.status(200).json({message: 'Code execution result'});
}

module.exports = {
    executeSourceCode
}