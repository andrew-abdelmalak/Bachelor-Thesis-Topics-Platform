import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

const FilterDropdown = ({ label, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) {
            return options.filter(([_, count]) => count > 0);
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
        return options.filter(([value, count]) =>
            value.toLowerCase().includes(lowerCaseSearchTerm) && count > 0
        );
    }, [options, searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2 text-left rounded-lg flex justify-between items-center 
                    bg-white border border-gray-200 hover:border-gray-300"
            >
                <span className="truncate">
                    {selected.size > 0 ? `${label} (${selected.size})` : label}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute z-[60] w-full mt-1 rounded-lg shadow-lg overflow-hidden 
                    bg-white border border-gray-200"
                    style={{
                        maxWidth: "100%",
                        transform: "none",
                        left: 0,
                        top: "100%"
                    }}
                >
                    <div className="px-2 py-1">
                        <input
                            type="text"
                            placeholder={`Search ${label}...`}
                            value={searchTerm}
                            onChange={handleSearchChange}
                            autoFocus
                            className="w-full px-2 py-1 rounded-md text-sm bg-gray-100 
                                text-gray-900 placeholder-gray-500"
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(([value, count]) => (
                                <label
                                    key={value}
                                    className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.has(value)}
                                        onChange={() => onChange(value)}
                                        className="rounded mr-3"
                                    />
                                    <span className="flex-1">{value}</span>
                                    <span className="text-sm text-gray-500">({count})</span>
                                </label>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                                No matching options available
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilterDropdown;
