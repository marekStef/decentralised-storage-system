import { colors } from '@/constants/colors';
import React from 'react';

const SquareButton = props => {
    return (
        <button
            onClick={props.onClick}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                cursor: "pointer",
                padding: '0.4rem',
                borderWidth: '1px',
                borderColor: colors.gray2,
                borderStyle: 'solid',
                ...props.style
            }}
            className="hover:bg-slate-50"
        >
            {...props.children}
        </button>
    )
}

export default SquareButton;