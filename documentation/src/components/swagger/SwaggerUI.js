import React, { useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUIComponent = () => {
    const [host, setHost] = useState('localhost');
    const [port, setPort] = useState('3003');

    const [swaggerSpec, setSwaggerSpec] = useState({
        swagger: '2.0',
        info: {
            version: '1.0.0',
            title: 'Execution Service Interface API',
        },
        host: 'localhost:3003',
        basePath: '/',
        schemes: ['http'],
        
        paths: {
            '/uploadNewSourceCode': {
                post: {
                    summary: 'Upload new source code',
                    description: 'Uploads a new source code and returns the source code ID.',
                    consumes: ['multipart/form-data'],
                    parameters: [
                        {
                            name: 'files',
                            in: 'formData',
                            type: 'file',
                            required: true,
                            description: 'The source code files.',
                        },
                    ],
                    responses: {
                        201: {
                            description: 'Source code uploaded successfully',
                            schema: {
                                type: 'object',
                                properties: {
                                    sourceCodeId: {
                                        type: 'string',
                                        example: 'd33075f0-8b1f-4dbf-8bfb-35eab508acfa'
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Files were uploaded.'
                                    }
                                }
                            }
                        },
                        400: {
                            description: 'Bad Request - Files do not conform to the requirements each execution service puts on its programming language specific source code. Each execution service needs to specify its requirements on the source code explicitly',
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'All files must be JavaScript files.'
                                    }
                                }
                            }
                        },
                        500: {
                            description: "Something went wrong during the uploading of the source code.",
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Something went wrong during the uploading.'
                                    }
                                }
                            }
                        }
                    },
                },
            },
            '/sourceCodes/{sourceCodeId}': {
                get: {
                    summary: 'Get a given source code',
                    description: 'Retrieves the source code files for the specified ID.',
                    parameters: [
                        {
                            name: 'sourceCodeId',
                            in: 'path',
                            required: true,
                            type: 'string',
                            description: 'The ID of the source code to retrieve.',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Source code retrieved successfully',
                            schema: {
                                type: 'object',
                                properties: {
                                    sourceCode: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                name: {
                                                    type: 'string',
                                                    example: 'main.js'
                                                },
                                                language: {
                                                    type: 'string',
                                                    example: 'javascript'
                                                },
                                                code: {
                                                    type: 'string',
                                                    example: "const helloWorld = (someExampleInputObject) => {\r\n    return getResponseMessage() + someExampleInputObject.name;\r\n}\r\n\r\nmodule.exports = helloWorld;"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        404: {
                            description: 'Source code with given ID not found.',
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Source code not found.'
                                    }
                                }
                            }
                        },
                        500: {
                            description: "Failed to read source code files.",
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Something went wrong while retrieving the source code.'
                                    }
                                }
                            }
                        }
                    },
                },
                delete: {
                    summary: 'Delete source code',
                    description: 'Deletes the source code for the given ID.',
                    parameters: [
                        {
                            name: 'sourceCodeId',
                            in: 'path',
                            required: true,
                            type: 'string',
                            description: 'The ID of the source code to delete.',
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Source code deleted successfully',
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Source code deleted successfully.'
                                    }
                                }
                            }
                        },
                        404: {
                            description: 'Source code not found',
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Source code not found.'
                                    }
                                }
                            }
                        },
                        500: {
                            description: "Failed to delete given source code.",
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Something went wrong during the deletion process.'
                                    }
                                }
                            }
                        }
                    },
                },
            },
            '/executeSourceCode/{sourceCodeId}': {
                post: {
                    summary: 'Execute source code',
                    description: 'Executes the source code with the given source code ID.',
                    parameters: [
                        {
                            name: 'sourceCodeId',
                            in: 'path',
                            required: true,
                            type: 'string',
                            description: 'The ID of the source code to execute.',
                        },
                        {
                            name: 'parametersForMainEntry',
                            description: 'Parameters for the main entry of the source code. This is required and must be a valid object.',
                            in: 'body',
                            required: true,
                            schema: {
                                type: 'object',
                                example: {
                                    parameter1: 'Some parameter',
                                    parameter2: 2,
                                    parameter3: {
                                        name: 'Name',
                                        surname: 'Surname'
                                    }
                                }
                            },
                        },
                    ],
                    responses: {
                        200: {
                            description: 'Code execution result',
                            schema: {
                                type: 'object',
                                properties: {
                                    result: {
                                        type: 'string',
                                        example: '[anything returned from the source code that is stringified]'
                                    }
                                }
                            }
                        },
                        400: {
                            description: "Failed to process given request. Example response contains multiple types of responses.",
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Source code not available - it exists but some error happened while loading it. | There is a syntax error. Code could not be loaded | Problem loading a module'
                                    }
                                }
                            }
                        },
                        404: {
                            description: "Given source code does not exist.",
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Given source code does not exist.'
                                    }
                                }
                            }
                        },
                        500: {
                            description: "Failed to process given request.",
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                        example: 'Server error while trying to process given request.'
                                    }
                                }
                            }
                        }
                    },
                },
            }
        },
    });

    const handleHostChange = (event) => {
        setHost(event.target.value);
        updateSwaggerSpec(event.target.value, port);
    };

    const handlePortChange = (event) => {
        setPort(event.target.value);
        updateSwaggerSpec(host, event.target.value);
    };

    const updateSwaggerSpec = (host, port) => {
        setSwaggerSpec(prevSpec => ({
            ...prevSpec,
            host: `${host}:${port}`
        }));
    };

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <p>If you want to execute the following requests, adjust host and port in the following fields.</p>
                <label style={{ marginRight: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>
                    Host:
                    <input
                        type="text"
                        value={host}
                        onChange={handleHostChange}
                        style={{
                            marginLeft: '1rem',
                            padding: '0.4rem',
                            fontSize: '0.9rem',
                            borderRadius: '0.4rem',
                            border: '1px solid #ccc',
                        }}
                    />
                </label>
                <label style={{ marginRight: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>
                    Port:
                    <input
                        type="text"
                        value={port}
                        onChange={handlePortChange}
                        style={{
                            marginLeft: '1rem',
                            padding: '0.4rem',
                            fontSize: '0.9rem',
                            borderRadius: '0.4rem',
                            border: '1px solid #ccc',
                        }}
                    />
                </label>
            </div>

            <SwaggerUI spec={swaggerSpec} docExpansion="full" />
        </div>
    );
    
};

export default SwaggerUIComponent;
