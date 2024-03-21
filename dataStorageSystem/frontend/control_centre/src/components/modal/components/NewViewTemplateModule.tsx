import React, { useState } from 'react';
import axios from 'axios';
import '../../../css/globals.css'
import { showError } from '@/helpers/alerts';
function MultipartForm() {
    const [files, setFiles] = useState([]);
    const [profile, setProfile] = useState('');
    const [runtime, setRuntime] = useState('');
    const [configuration, setConfiguration] = useState('');
    const [templateName, setTemplateName] = useState('');

    const handleFileChange = (event) => {
        setFiles(files => [...files, ...Array.from(event.target.files)]);
    };

    const handleDeleteFile = (fileIndex) => {
        setFiles(files => files.filter((_, index) => index !== fileIndex));
    };


    const handleProfileChange = (event) => {
        setProfile(event.target.value);
    };

    const handleRuntimeChange = (event) => {
        setRuntime(event.target.value);
    };

    const handleConfigurationChange = (event) => {
        setConfiguration(event.target.value);
    };

    const handleTemplateNameChange = (event) => {
        setTemplateName(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const formData = new FormData();
        files.forEach(file => {
            console.log(file);
            formData.append('files', file);
        });
        formData.append('profiles', profile);
        formData.append('runtime', runtime);
        formData.append('configuration', configuration);
        formData.append('templateName', templateName);

        axios.post(`${process.env.NEXT_PUBLIC_VIEW_MANAGER_ADDRESS}/viewTemplates/createNewViewTemplate`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.error(error);
                if (error?.response?.data?.message)
                    showError(error.response.data.message);
                else showError('Something went wrong during the creation of the new View Template')
            });
    };

    return (
        <>
            <h1 className='text-lg text-center text-gray-400'>New View Template</h1>
            <hr className="h-px mt-1 mb-6 bg-gray-200 border-0 dark:bg-gray-600" />  

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className='w-full h-full flex flex-col items-center '>
                    <label htmlFor="file-upload" className="bg-gray-600 p-2 cursor-pointer rounded-md">
                        Select Source Code
                    </label>
                    <input
                        id="file-upload"
                        type="file"
                        name="files"
                        multiple
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <ul className='self-start'>
                        {files.map((file, index) => (
                            <li key={index} style={{ listStyleType: 'none', margin: '10px 0' }}>
                                <button className='bg-red-600 p-2 cursor-pointer rounded-md mr-4' type="button" onClick={() => handleDeleteFile(index)}>
                                    Delete
                                </button>

                                {file.name}
                            </li>
                        ))}
                    </ul>

                    <button type="submit" className='bg-blue-600 hover:bg-blue-700 transition p-2 cursor-pointer rounded-md m-6 self-stretch'>Submit Template</button>

                </div>

            </form>
        </>

    );
}

export default MultipartForm;
