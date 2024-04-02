import React, { useState } from 'react';
import axios from 'axios';
import { showError, showSuccess } from '@/helpers/alerts';
import { FaAngleDown, FaAngleUp, FaCheck, FaTimes } from 'react-icons/fa';
import { FormEventHandler } from 'react';

function MultipartForm() {
    const [files, setFiles] = useState<File[]>([]);
    const [profiles, setProfiles] = useState<any[]>([]);

    const [runtime, setRuntime] = useState('');
    const [templateName, setTemplateName] = useState('');

    const [isNewTemplateCreationSuccessful, setIsNewTemplateCreationSuccessful] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(files => [...files, ...Array.from(event.target.files)]);
        }
    };

    const handleDeleteFile = (fileIndex: number) => {
        setFiles(files => files.filter((_, index) => index !== fileIndex));
    };

    const handleProfileFieldChange = (index: number, field: string, value: any) => {
        console.log(value);
        setProfiles(profiles => profiles.map((profile, i) => i === index ? { ...profile, [field]: value } : profile));
    };

    const handleAddProfile = () => {
        setProfiles(profiles => [...profiles, { profile: '', read: false, create: false, modify: false, delete: false }]);
    };

    const handleRemoveProfile = (index: number) => {
        setProfiles(profiles => profiles.filter((_, i) => i !== index));
    };

    const handleRuntimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRuntime(event.target.value);
    };

    const handleTemplateNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTemplateName(event.target.value);
    };

    const handleSubmit = (event: any) => {
        event.preventDefault();

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        console.log(profiles);
        formData.append('profiles', JSON.stringify(profiles));
        formData.append('runtime', runtime);
        formData.append('templateName', templateName);

        axios.post(`${process.env.NEXT_PUBLIC_VIEW_MANAGER_ADDRESS}/viewTemplates/createNewViewTemplate`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                console.log(response);
                showSuccess(response.data.message);
                setIsNewTemplateCreationSuccessful(true);
            })
            .catch(error => {
                console.error(error);
                if (error?.response?.data?.message)
                    showError(error.response.data.message);
                else showError('Something went wrong during the creation of the new View Template')
            });
    };

    if (isNewTemplateCreationSuccessful) return (
        <div className='text-green-500 flex flex-col items-center justify-center w-full h-full'>
            <FaCheck className="text-green-500" size="3rem" />

            <p className='text-center'>Template Created</p>
        </div>
    )

    return (
        <>
            <h1 className='text-lg text-center text-gray-500'>New Template</h1>
            <hr className="h-px my-6 bg-gray-700 border-0 w-full" />

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="runtime-dropdown bg-gray-900 p-4 rounded-lg shadow-sm flex flex-col space-y-2 mb-4">
                    <label htmlFor="runtime" className="block text-sm font-medium text-gray-700">Choose Template Name</label>
                    <div className="flex items-center justify-between space-x-2">
                        <input type="text" value={templateName} onChange={handleTemplateNameChange} placeholder="Template Name" className="input text-sm p-2 rounded border-gray-300 w-full bg-gray-800" />
                    </div>
                </div>

                <div className="runtime-dropdown bg-gray-900 p-4 rounded-lg shadow-sm flex flex-col space-y-2 mb-4">
                    <label htmlFor="runtime" className="block text-sm font-medium text-gray-700">Choose Runtime</label>
                    <select
                        id="runtime"
                        value={runtime}
                        onChange={handleRuntimeChange}
                        className=" bg-gray-800 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                        <option value="" disabled>Select your option</option>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                    </select>
                </div>

                <div className='w-full h-full flex flex-col '>
                    <div className="w-full h-full runtime-dropdown bg-gray-900 p-4 rounded-lg shadow-sm flex flex-col space-y-2 mb-4">
                        <label className="block text-sm font-medium text-gray-700">Choose Source Codes</label>

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
                                    <button className='text-sm bg-red-900 text-red-200 p-1 cursor-pointer rounded-md mr-4' type="button" onClick={() => handleDeleteFile(index)}>
                                        Delete
                                    </button>

                                    {file.name}
                                </li>
                            ))}
                        </ul>

                        <label htmlFor="file-upload" className="text-sm bg-gray-800 p-2 cursor-pointer rounded-md">
                            Select Source Code
                        </label>
                    </div>

                    {profiles.map((profile, index) => (
                        <div key={index} className="profile-management-grid bg-gray-900 p-4 rounded-lg shadow-sm w-full space-y-4 mb-4">
                            <label className="block text-sm font-medium text-gray-700">Profile</label>
                            <div className="flex items-center justify-between space-x-2">
                                <input type="text" value={profile.profile} onChange={e => handleProfileFieldChange(index, 'profile', e.target.value)} placeholder="Profile Name" className="input text-sm p-2 rounded border-gray-300 w-full bg-gray-800" />
                                <button type="button" onClick={() => handleRemoveProfile(index)} className="text-sm bg-red-900 text-red-200 p-1 cursor-pointer rounded-md mr-4">
                                    Remove
                                </button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={profile.read} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProfileFieldChange(index, 'read', e.target.checked)} />
                                    <span className='text-sm text-gray-400'>Read</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={profile.create} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProfileFieldChange(index, 'create', e.target.checked)} />
                                    <span className='text-sm text-gray-400'>Create</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={profile.modify} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProfileFieldChange(index, 'modify', e.target.checked)} />
                                    <span className='text-sm text-gray-400'>Modify</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="checkbox" checked={profile.delete} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProfileFieldChange(index, 'delete', e.target.checked)} />
                                    <span className='text-sm text-gray-400'>Delete</span>
                                </label>

                            </div>
                        </div>
                    ))}

                    <button type="button" onClick={handleAddProfile} className='bg-green-800 text-green-100 hover:bg-green-700 transition p-2 cursor-pointer rounded-md self-center'>Add Profile</button>

                    <button type="submit" className='bg-blue-600 hover:bg-blue-700 transition p-2 cursor-pointer rounded-md my-6 self-stretch'>Submit Template</button>

                </div>

            </form>
        </>

    );
}

export default MultipartForm;
