import React from 'react';

const StandardButton = props => {
    return (
        <button
            className={`text-left py-2 px-2 font-semibold rounded-lg mx-4 mr-0 my-2 text-3xs text-white flex items-center text-gray-700`}
            onClick={props.onClick}
        >

        </button>
    )
}

export default StandardButton;