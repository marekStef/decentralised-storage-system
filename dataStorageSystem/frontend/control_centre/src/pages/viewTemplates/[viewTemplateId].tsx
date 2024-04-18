import React, { useEffect, useState } from 'react';
import { FaAngleDown, FaAngleUp, FaCheck, FaTimes } from 'react-icons/fa';

import { useRouter } from 'next/router';
import '../../app/globals.css'
import { showError, showSuccess } from '@/helpers/alerts';
import CodeComponent from '@/components/code/CodeComponent';
import { getSpecificViewTemplate } from '@/network/networkHelpers';
import CopyToClipboardText from '@/components/copyToClipboard/CopyToClipboardText';

const ViewTemplate = props => {
    const router = useRouter();
    const { viewTemplateId } = router.query;

    const [templateData, setTemplateData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadViewTemplateData = (viewTemplateId: string) => {
        getSpecificViewTemplate(viewTemplateId)
            .then(data => {
                setTemplateData(data);
                console.log(data);
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    useEffect(() => {
        if (!viewTemplateId) return;
        loadViewTemplateData(viewTemplateId as string);
    }, [viewTemplateId])

    const codeString = `const greeting = 'Hello, world!';`;

    if (loading) return <p>Loading ...</p>

    // return (
    //     // <div>
    //     //     {viewTemplateId}
    //     //     {templateData?.sourceCode.map((file, index) => (
    //     //         <div key={index}>
    //     //             <CodeComponent fileName={file.name} codeString={file.code} language={file.language} />
    //     //         </div>
    //     //     ))}
    //     // </div>
    //     <div className="container mx-auto px-4 py-8">
    //         <div className="mb-8">
    //             <h1 className="text-2xl font-bold">View Template: {templateData?.template.templateName}</h1>
    //             <p className="text-gray-700">Template ID: {viewTemplateId}</p>
    //             <p className="text-gray-700">Created Date: {new Date(templateData?.template.createdDate).toLocaleDateString()}</p>
    //         </div>
    //         <div>
    //             <h2 className="text-xl font-semibold mb-4">Source Code Files</h2>
    //             {templateData?.sourceCode.map((file, index) => (
    //                 <div key={index} className="mb-6">
    //                     <CodeComponent fileName={file.name} codeString={file.code} language={file.language} />
    //                 </div>
    //             ))}
    //         </div>
    //     </div>
    // )

    return (
        <div className="bg-gray-50 min-h-screen p-8">
            {loading ? (
                <p className="text-center text-lg">Loading ...</p>
            ) : (
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">Template Details</h1>
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Basic Info</h2>
                        <p><strong>Template Name:</strong> {templateData.template.templateName}</p>
                        <p className='inline'><strong>Template ID:</strong></p> <CopyToClipboardText value={templateData.template._id} className=''/>
                        <p className="text-sm font-thin text-gray-800">You can copy this Template ID to your app which can create View Instance off of it</p>
                        <p><strong>Runtime:</strong> {templateData.template.metadata.runtime}</p>
                        <p><strong>Created Date:</strong> {new Date(templateData.template.createdDate).toLocaleString()}</p>
                    </div>
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Profiles</h2>
                        {templateData.template.profiles.map((profile, index) => (
                            <div key={index} className="mb-4">
                                <p><strong>Profile: {profile.profile}</strong></p>
                                <p className="flex items-center">Read: <span className="ml-2">{profile.read ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}</span></p>
                                <p className="flex items-center">Create: <span className="ml-2">{profile.create ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}</span></p>
                                <p className="flex items-center">Modify: <span className="ml-2">{profile.modify ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}</span></p>
                                <p className="flex items-center">Delete: <span className="ml-2">{profile.delete ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}</span></p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white shadow rounded-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Usage</h2>
                        <div className="mb-4">
                            <p className="flex items-center">Is in use: <span className="ml-2">{templateData.isInUse ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />}</span></p>
                            {templateData.viewInstances.map((viewInstance, index) => {
                                <p>{viewInstance._id}</p>
                            })}
                        </div>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Source Code</h2>
                    {templateData.sourceCode.map((file, index) => (
                        <div key={index} className="mb-6">
                            <CodeComponent fileName={file.name} codeString={file.code} language={file.language} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ViewTemplate;