import React, { useState } from 'react';
import { darken } from 'polished';
import persistenceManager from '@/data/PersistenceManager';

interface CategoryBarParams {
    windowsAppsCategoriesPercentagesForGivenHour: object
}

const CategoryBar: React.FC<CategoryBarParams> = (params) =>  {
    
    const [hoveredCategory, setHoveredCategory] = useState(null);

    // const categories = {
    //     'productivity': 0.5,
    //     'entertainment': 0.1,
    //     'work': 0.3,
    //     'family': 0.1
    // };

    // const colors = {
    //     'productivity': '#cebaaa',
    //     'entertainment': '#fccbbb',
    //     'work': '#feaccc',
    //     'family': '#baefff'
    // };

    const colors = persistenceManager.getSavedWindowsAppsCategories();

    const getDarkerColor = (color) => darken(0.4, color);
    return (
        <div 
            className="flex flex-col w-full h-full absolute" 
            style={{zIndex: 100}}
        >
            {Object.entries(params.windowsAppsCategoriesPercentagesForGivenHour).map(([categoryType, percentage]) => (
                <div
                    key={categoryType}
                    onMouseEnter={() => setHoveredCategory(categoryType)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    className={`categoryBar ${hoveredCategory === categoryType ? 'hovered' : ''}`}
                    style={{
                        height: `${percentage * 100}%`,
                        width: hoveredCategory === categoryType ? '2200%' : '100%',
                        background: `linear-gradient(to right, ${colors[categoryType]?.color || '#ccc'} 30%, transparent 100%)`,
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
                            color: getDarkerColor(colors[categoryType]?.color || '#ccc'),
                            fontSize: "12px",
                        }}>{categoryType} ({(percentage * 100).toFixed(2)}%)</span>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CategoryBar;
