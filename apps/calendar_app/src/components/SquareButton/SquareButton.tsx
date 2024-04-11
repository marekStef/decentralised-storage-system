import { colors } from '@/constants/colors';
import React from 'react';
import Link from 'next/link';

const SquareButton = ({ onClick, href, style, children, ...props }) => {
    const buttonContent = (
        <button
            onClick={onClick}
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
                ...style
            }}
            className="hover:bg-slate-50"
            {...props}
        >
            {children}
        </button>
    );

    return href ? (
        <Link href={href}>
            {buttonContent}
        </Link>
    ) : (
        buttonContent
    );
}

export default SquareButton;
