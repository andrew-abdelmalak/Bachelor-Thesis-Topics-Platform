import React from 'react';
import Tooltip from './Tooltip';

const SortableHeader = React.memo(({ title, sortKey, sortConfig, handleSort }) => {
    const isSorted = sortConfig.key === sortKey;
    const getTooltipDescription = () => {
        if (!isSorted) return "Click to sort ascending";
        if (sortConfig.direction === 'asc') return "Click to sort descending";
        return "Click to remove sorting";
    };

    return (
        <th
            className="px-6 py-4 text-left cursor-pointer select-none 
                hover:bg-gray-50/90 text-gray-700 font-medium text-base"
            onClick={() => handleSort(sortKey)}
        >
            <Tooltip
                text={`Sort by ${title}`}
                description={getTooltipDescription()}
            >
                <div className="flex items-center gap-2">
                    {title}
                    {isSorted && (
                        <span className="text-base">
                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                    )}
                </div>
            </Tooltip>
        </th>
    );
});

export default SortableHeader;
