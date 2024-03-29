import React, { useState } from 'react';
import { darken } from 'polished';

const CategoryBar = () => {
    const [hoveredCategory, setHoveredCategory] = useState(null);

    const categories = [
        { categoryType: 'productivity', percentage: 0.5 },
        { categoryType: 'entertainment', percentage: 0.1 },
        { categoryType: 'work', percentage: 0.3 },
        { categoryType: 'family', percentage: 0.1 }
    ];

    const colors = {
        'productivity': '#cdb4db',
        'entertainment': '#ffc8dd',
        'work': '#ffafcc',
        'family': '#bde0fe'
    };

    const getDarkerColor = (color) => darken(0.2, color);

    return (
        <div className="flex flex-col w-full h-full relative" style={{zIndex: 1000}}>
            {categories.map(({ categoryType, percentage }) => (
                <div
                    key={categoryType}
                    onMouseEnter={() => setHoveredCategory(categoryType)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`categoryBar ${hoveredCategory === categoryType ? 'hovered' : ''}`}
                    style={{
                        height: `${percentage * 100}%`,
                        width: hoveredCategory === categoryType ? '600%' : '100%',
                        background: `linear-gradient(to right, ${colors[categoryType]} 30%, transparent 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        position: 'relative',
                        transition: 'width 0.3s ease',
                    }}
                >
                    {hoveredCategory === categoryType && (
                        <span style={{
                            marginLeft: '20px',
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            whiteSpace: 'nowrap',
                            color: getDarkerColor(colors[categoryType]),
                            fontSize: "12px",
                        }}>{categoryType}</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CategoryBar;
