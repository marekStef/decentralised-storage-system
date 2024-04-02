import React, { useState } from 'react';
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
const { docco } = require('react-syntax-highlighter/dist/cjs/styles/hljs'); // using import throws error - leave it as is
import { FaAngleDown, FaAngleUp } from 'react-icons/fa';

interface CodeComponentParams {
    codeString: string;
    language: string;
    fileName: string;
  }

const CodeComponent: React.FC<CodeComponentParams> = ({ codeString, language, fileName }) => {
    const [isCodeVisible, setIsCodeVisible] = useState(true);
    const validLanguage = ['javascript', 'python'].includes(language) ? language : 'javascript';

    const toggleCodeVisibility = () => setIsCodeVisible(!isCodeVisible);

    return (
        <div>
            <div className='bg-white flex justify-between items-center cursor-pointer p-4 rounded-t-lg' style={{ borderBottom: '1px solid #ddd' }} onClick={toggleCodeVisibility}>
                <span>{fileName || 'CodeSnippet.js'}</span>
                {isCodeVisible ? <FaAngleUp /> : <FaAngleDown />}
            </div>
            {isCodeVisible && (
                <SyntaxHighlighter language={validLanguage} style={docco}>
                    {codeString}
                </SyntaxHighlighter>
            )}
        </div>
    );
};

export default CodeComponent;