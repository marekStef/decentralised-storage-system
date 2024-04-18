import { showError, showSuccess } from '@/helpers/alerts';

interface CopyToClipboardTextParams {
    value: string,
    className: string
}
const CopyToClipboardText: React.FC<CopyToClipboardTextParams> = ({ value, className }) => {
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(value);
            showSuccess('Copied to clipboard!');
        } catch (err) {
            showError('Failed to copy:' + err)
        }
    };

    return (
        <div className={`${className} inline`}>
            <code className="bg-gray-100 hover:text-gray-500 text-gray-900 py-1 px-3 rounded break-words w-full cursor-pointer" onClick={copyToClipboard}>{value}</code>
        </div>
    );
};

export default CopyToClipboardText;