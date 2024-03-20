import React, { useEffect, useState } from 'react';

import { getAllViewTemplates } from "../../../network/networkHelpers";
import Link from 'next/link';

type TemplateProfile = {
    profile: string;
    read: boolean;
    create: boolean;
    modify: boolean;
    delete: boolean;
    _id: string;
};

type Template = {
    _id: string;
    templateName: string;
    sourceCodeId: string;
    metadata: {
        runtime: string;
    };
    profiles: TemplateProfile[];
    createdDate: string;
    __v: number;
};

const ViewTemplatesModule = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        getAllViewTemplates()
            .then(templatesResult => {
                setTemplates(templatesResult);
            })
            .catch(err => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            })
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-4 ">
            {templates.map((template) => (
                
                <div key={template._id} className="p-4 shadow-lg rounded-lg bg-gray-900 hover:shadow-2xl">
                    <Link href={`/viewTemplates/${template._id}`}>
                        <h2 className="text-lg font-semibold">{template.templateName} <span className="text-sm text-gray-500">{new Date(template.createdDate).toLocaleString()}</span></h2>
                        <p className="text-md text-gray-300">
                            <b>Source Code ID: </b>{template.sourceCodeId}</p>
                        <p className="text-md text-gray-300"><b>Runtime: </b>{template.metadata.runtime}</p>
                            <h3 className="text-md text-gray-300"><b>Profiles: </b></h3>
                            <ul className='list-disc ml-6'>
                                {template.profiles.map((profile) => (
                                    <li key={profile._id} className="text-sm">
                                        <p>{profile.profile}</p>
                                        {/* <p>Read: {profile.read ? 'Yes' : 'No'}</p>
                                        <p>Create: {profile.create ? 'Yes' : 'No'}</p>
                                        <p>Modify: {profile.modify ? 'Yes' : 'No'}</p>
                                        <p>Delete: {profile.delete ? 'Yes' : 'No'}</p> */}
                                    </li>
                                ))}
                            </ul>
                            
                    </Link>
                    
                    
                </div>
            ))}
        </div>
    );
};

export default ViewTemplatesModule;