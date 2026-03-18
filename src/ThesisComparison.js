import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Filter, X } from 'lucide-react';
import { projectData } from './Data';
import * as XLSX from 'xlsx';
import { useDebounce } from 'use-debounce';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from './components/Card';
import FilterDropdown from './components/FilterDropdown';
import HighlightedText from './components/HighlightedText';
import ConfirmationModal from './components/ConfirmationModal';
import SortableHeader from './components/SortableHeader';
import PriorityListModal from './components/PriorityListModal';
import Toast from './components/Toast';
import Tooltip from './components/Tooltip';


export default function ThesisComparisonSystem() {
    // Load initial states from localStorage with proper Set conversion
    const initialStates = useMemo(() => {
        try {
            const savedFilters = JSON.parse(localStorage.getItem('filters')) || {
                supervisors: [],
                departments: [],
                fields: [],
                eligibleDepts: [],
                searchTerm: ''
            };

            // Convert arrays to Sets and load selectedProjects
            return {
                filters: {
                    supervisors: new Set(savedFilters.supervisors),
                    departments: new Set(savedFilters.departments),
                    fields: new Set(savedFilters.fields),
                    eligibleDepts: new Set(savedFilters.eligibleDepts),
                    searchTerm: savedFilters.searchTerm
                },
                expandedRows: new Set(JSON.parse(localStorage.getItem('expandedRows')) || []),
                sortConfig: JSON.parse(localStorage.getItem('sortConfig')) || { key: null, direction: null },
                scrollPosition: parseInt(localStorage.getItem('scrollPosition')) || 0,
                showFilters: localStorage.getItem('showFilters') === 'true',
                // Add selectedProjects to initial states
                selectedProjects: new Set(JSON.parse(localStorage.getItem('selectedProjects')) || [])
            };
        } catch (error) {
            console.error('Error loading saved states:', error);
            return {
                filters: {
                    supervisors: new Set(),
                    departments: new Set(),
                    fields: new Set(),
                    eligibleDepts: new Set(),
                    searchTerm: ''
                },
                expandedRows: new Set(),
                sortConfig: { key: null, direction: null },
                scrollPosition: 0,
                showFilters: false,
                selectedProjects: new Set()
            };
        }
    }, []);

    // Initialize states with saved values
    const [multiFilters, setMultiFilters] = useState(initialStates.filters);
    const [expandedRows, setExpandedRows] = useState(initialStates.expandedRows);
    const [sortConfig, setSortConfig] = useState(initialStates.sortConfig);
    const [showFilters, setShowFilters] = useState(initialStates.showFilters);

    // Reference for the table container
    const tableContainerRef = useRef(null);

    // Save states with proper Set conversion
    useEffect(() => {
        try {
            // Convert Sets to arrays for storage
            const filtersForStorage = {
                supervisors: Array.from(multiFilters.supervisors),
                departments: Array.from(multiFilters.departments),
                fields: Array.from(multiFilters.fields),
                eligibleDepts: Array.from(multiFilters.eligibleDepts),
                searchTerm: multiFilters.searchTerm
            };

            localStorage.setItem('filters', JSON.stringify(filtersForStorage));
            localStorage.setItem('expandedRows', JSON.stringify(Array.from(expandedRows)));
            localStorage.setItem('sortConfig', JSON.stringify(sortConfig));
            localStorage.setItem('showFilters', showFilters.toString());
        } catch (error) {
            console.error('Error saving states:', error);
        }
    }, [multiFilters, expandedRows, sortConfig, showFilters]);

    // Save scroll position when scrolling
    useEffect(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        // Debounced scroll handler to avoid too frequent updates
        let timeoutId;
        const handleScroll = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                localStorage.setItem('scrollPosition', container.scrollTop.toString());
            }, 100); // Debounce time of 100ms
        };

        container.addEventListener('scroll', handleScroll);

        // Restore scroll position after a short delay to ensure content is loaded
        const restoreScrollTimeout = setTimeout(() => {
            const savedScrollPosition = parseInt(localStorage.getItem('scrollPosition')) || 0;
            container.scrollTop = savedScrollPosition;
        }, 100);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
            clearTimeout(restoreScrollTimeout);
        };
    }, []);

    // Add cleanup when component unmounts
    useEffect(() => {
        // Store ref in a variable that will be captured in the closure
        const containerRef = tableContainerRef.current;

        return () => {
            // Use the captured ref value in cleanup
            if (containerRef) {
                localStorage.setItem('scrollPosition', containerRef.scrollTop.toString());
            }
        };
    }, []);

    const [selectedProjects, setSelectedProjects] = useState(initialStates.selectedProjects);
    const [priorityList, setPriorityList] = useState([]);
    const [showPriorityList, setShowPriorityList] = useState(false);
    const [showClearConfirmation, setShowClearConfirmation] = useState(false);
    const [showWhatsAppConfirmation, setShowWhatsAppConfirmation] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [debouncedSearchTerm] = useDebounce(multiFilters.searchTerm, 300);

    const [toast, setToast] = useState(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const savedPriorityList = localStorage.getItem('priorityList');
        if (savedPriorityList) {
            try {
                setPriorityList(JSON.parse(savedPriorityList));
            } catch (error) {
                console.error('Error loading priority list:', error);
                // Display error to user
                alert('Error loading priority list. Please try again.');
                setPriorityList([]);
            }
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('priorityList', JSON.stringify(priorityList));
        } catch (error) {
            console.error('Error saving priority list:', error);
            // Display error to user
            alert('Error saving priority list. Please try again.');
        }
    }, [priorityList]);

    // Add useEffect to save selectedProjects
    useEffect(() => {
        try {
            localStorage.setItem('selectedProjects', JSON.stringify(Array.from(selectedProjects)));
        } catch (error) {
            console.error('Error saving selected projects:', error);
        }
    }, [selectedProjects]);

    const handleSort = useCallback((key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                // Cycle through: asc -> desc -> null
                if (prev.direction === 'asc') {
                    return { key, direction: 'desc' };
                } else if (prev.direction === 'desc') {
                    return { key: null, direction: null };
                }
            }
            // Default to ascending when first clicking
            return { key, direction: 'asc' };
        });
    }, []);

    // No more N/A replacement needed
    const processedData = useMemo(() => {
        return projectData;
    }, []);

    // Updated filtering logic
    const filteredAndSortedData = useMemo(() => {
        let result = processedData.filter((project) => {
            const matchesSearch = !multiFilters.searchTerm ||
                Object.values(project).some(value =>
                    String(value).toLowerCase().includes(multiFilters.searchTerm.toLowerCase())
                );

            const matchesSupervisor = multiFilters.supervisors.size === 0 ||
                multiFilters.supervisors.has(project.supervisorName) ||
                (project.coSupervisor && multiFilters.supervisors.has(project.coSupervisor));

            const matchesDepartment = multiFilters.departments.size === 0 ||
                multiFilters.departments.has(project.department);

            const matchesField = multiFilters.fields.size === 0 ||
                multiFilters.fields.has(project.researchField);

            const matchesEligibility = multiFilters.eligibleDepts.size === 0 ||
                (project.eligibleDepartments || []).some(dept => multiFilters.eligibleDepts.has(dept));

            return matchesSearch && matchesSupervisor && matchesDepartment &&
                matchesField && matchesEligibility;
        });

        if (sortConfig.key && sortConfig.direction) {
            result.sort((a, b) => {
                const aValue = String(a[sortConfig.key] || '').toLowerCase();
                const bValue = String(b[sortConfig.key] || '').toLowerCase();
                return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            });
        }

        return result;
    }, [multiFilters, sortConfig, processedData]);

    // Update the uniqueValues calculation to consider current filters
    const uniqueValues = useMemo(() => {
        // Helper function to check if an item passes current filters
        const passesCurrentFilters = (item, excludeCategory = null) => {
            if (excludeCategory !== 'supervisors' &&
                multiFilters.supervisors.size > 0 &&
                !multiFilters.supervisors.has(item.supervisorName) &&
                !multiFilters.supervisors.has(item.coSupervisor)) {
                return false;
            }

            if (excludeCategory !== 'departments' &&
                multiFilters.departments.size > 0 &&
                !multiFilters.departments.has(item.department)) {
                return false;
            }

            if (excludeCategory !== 'fields' &&
                multiFilters.fields.size > 0 &&
                !multiFilters.fields.has(item.researchField)) {
                return false;
            }

            if (excludeCategory !== 'eligibleDepts' &&
                multiFilters.eligibleDepts.size > 0 &&
                !item.eligibleDepartments?.some(dept => multiFilters.eligibleDepts.has(dept))) {
                return false;
            }

            return true;
        };

        // Function to get filtered counts for each category
        const getFilteredCounts = (field, excludeCategory = null) => {
            const counts = new Map();
            const allValues = new Map(); // Changed to Map to store lowercase keys with original values

            // First pass: collect all possible values
            processedData.forEach(item => {
                if (field === 'supervisorName') {
                    [item.supervisorName, item.coSupervisor].forEach(value => {
                        if (value) {
                            const lowerValue = value.trim().toLowerCase();
                            if (!allValues.has(lowerValue)) {
                                allValues.set(lowerValue, value.trim());
                            }
                        }
                    });
                } else if (field === 'eligibleDepartments') {
                    (item[field] || []).forEach(value => {
                        const lowerValue = value.toLowerCase();
                        if (!allValues.has(lowerValue)) {
                            allValues.set(lowerValue, value);
                        }
                    });
                } else if (field === 'researchField') {
                    // Special handling for research field
                    const value = item[field]?.trim() || '(Empty)'; // Use '(Empty)' for empty fields
                    const lowerValue = value.toLowerCase();
                    if (!allValues.has(lowerValue)) {
                        allValues.set(lowerValue, value);
                    }
                } else if (item[field]) {
                    const lowerValue = item[field].toLowerCase();
                    if (!allValues.has(lowerValue)) {
                        allValues.set(lowerValue, item[field]);
                    }
                }
            });

            // Second pass: count occurrences considering filters
            allValues.forEach((originalValue, lowerValue) => {
                let count = 0;
                processedData.forEach(item => {
                    if (!passesCurrentFilters(item, excludeCategory)) return;

                    if (field === 'supervisorName') {
                        if (item.supervisorName?.toLowerCase() === lowerValue ||
                            item.coSupervisor?.toLowerCase() === lowerValue) count++;
                    } else if (field === 'eligibleDepartments') {
                        if (item[field]?.some(dept => dept.toLowerCase() === lowerValue)) count++;
                    } else if (field === 'researchField') {
                        // Special handling for research field counting
                        const itemValue = item[field]?.trim() || '(Empty)';
                        if (itemValue.toLowerCase() === lowerValue) count++;
                    } else {
                        if (item[field]?.toLowerCase() === lowerValue) count++;
                    }
                });
                counts.set(originalValue, count);
            });

            return Array.from(counts.entries())
                .sort((a, b) => b[1] - a[1]); // Sort by count descending
        };

        return {
            supervisors: getFilteredCounts('supervisorName', 'supervisors'),
            departments: getFilteredCounts('department', 'departments'),
            fields: getFilteredCounts('researchField', 'fields'),
            eligibleDepts: getFilteredCounts('eligibleDepartments', 'eligibleDepts')
        };
    }, [multiFilters, processedData]);

    const exportToExcel = async (data, filename) => {
        try {
            setIsLoading(true);

            // Transform data with minimal formatting
            const formattedData = data.map(project => ({
                'Supervisor Name': project.supervisorName || '',
                'Co-Supervisor': project.coSupervisor || '',
                'Supervisor Email': project.supervisorEmail || '',
                'Co-Supervisor Email': project.coSupervisorEmail || '',
                'Department': project.department || '',
                'Project Title': project.projectTitle || '',
                'Research Field': project.researchField || '',
                'Project Description': project.projectDescription || '',
                'Project Methodology': Array.isArray(project.projectMethodology)
                    ? project.projectMethodology.join(', ') : project.projectMethodology || '',
                'Qualifications': Array.isArray(project.qualifications)
                    ? project.qualifications.join(', ') : project.qualifications || '',
                'Further Comments': project.furtherComments || '',
                'Eligible Departments': (project.eligibleDepartments || []).join(', ')
            }));

            // Create worksheet
            const ws = XLSX.utils.json_to_sheet(formattedData, {
                cellStyles: true
            });

            // Simple column width calculation
            const calculateColWidths = (data) => {
                const colWidths = {};
                const headers = Object.keys(data[0]);

                // Initialize with header lengths
                headers.forEach((header, idx) => {
                    colWidths[idx] = Math.min(header.length, 30); // Start with header width, max 30
                });

                // Check content lengths
                data.forEach(row => {
                    Object.values(row).forEach((cell, idx) => {
                        const cellLength = String(cell || '').length;
                        colWidths[idx] = Math.min(
                            Math.max(colWidths[idx], Math.ceil(cellLength * 0.8)), // Use 80% of content length
                            30 // Hard max at 30 characters
                        );
                    });
                });

                return colWidths;
            };

            // Apply column widths
            const colWidths = calculateColWidths(formattedData);
            ws['!cols'] = Object.values(colWidths).map(width => ({
                wch: Math.max(width, 6) // Minimum 6 characters
            }));

            // Set row heights
            const defaultHeight = { hpt: 25 }; // Default height 25 points
            ws['!rows'] = Array(formattedData.length + 1).fill(defaultHeight);

            // Basic cell styling
            const range = XLSX.utils.decode_range(ws['!ref']);
            for (let R = range.s.r; R <= range.e.r; ++R) {
                for (let C = range.s.c; C <= range.e.c; ++C) {
                    const cellRef = XLSX.utils.encode_cell({ c: C, r: R });
                    if (!ws[cellRef]) continue;

                    // Basic cell properties
                    ws[cellRef].s = {
                        alignment: {
                            vertical: 'center',
                            horizontal: 'left',
                            wrapText: true
                        },
                        border: {
                            top: { style: 'thin' },
                            bottom: { style: 'thin' },
                            left: { style: 'thin' },
                            right: { style: 'thin' }
                        },
                        font: {
                            name: 'Arial',
                            sz: 10
                        }
                    };

                    // Header row styling
                    if (R === 0) {
                        ws[cellRef].s.font.bold = true;
                        ws[cellRef].s.fill = {
                            patternType: 'solid',
                            fgColor: { rgb: 'EEEEEE' }
                        };
                    }
                }
            }

            // Create workbook and add the worksheet
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Projects');

            // Write file
            XLSX.writeFile(wb, filename);
            setToast({ message: 'Export successful!', type: 'success' });
        } catch (error) {
            console.error('Export failed:', error);
            setToast({ message: 'Export failed. Please try again.', type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleMultiFilterChange = useCallback((category, value) => {
        setMultiFilters((prev) => {
            const newFilters = { ...prev };
            const categorySet = new Set(prev[category]);
            categorySet.has(value) ? categorySet.delete(value) : categorySet.add(value);
            newFilters[category] = categorySet;
            return newFilters;
        });
        // Reset expanded rows whenever filters change
        setExpandedRows(new Set());
    }, []);

    const clearFilters = useCallback(() => {
        setMultiFilters({
            supervisors: new Set(),
            departments: new Set(),
            fields: new Set(),
            eligibleDepts: new Set(),
            searchTerm: ''
        });
        // Reset expanded rows when filters are cleared
        setExpandedRows(new Set());
    }, []);
    const clearPriorityList = useCallback(() => {
        setPriorityList([]);
        setSelectedProjects(new Set());
        setPendingChanges([]);
        setShowClearConfirmation(false);
        setToast({ message: 'Priority list cleared!', type: 'success' });
    }, [setPriorityList, setSelectedProjects, setToast]);

    const handleWhatsAppHelp = useCallback(() => {
        const message = encodeURIComponent('Samooo 3lekooo El Tlaga Feha Maya 2al-Ana G3an Awee');
        window.open(`https://wa.me/201286735310?text=${message}`);
        setShowWhatsAppConfirmation(false);
    }, []);

    // Add new state for tracking changes
    const [pendingChanges, setPendingChanges] = useState([]);

    // Update selection handler
    const handleProjectSelection = useCallback((projectTitle) => {
        setSelectedProjects(prev => {
            const newSet = new Set(prev);
            if (prev.has(projectTitle)) {
                newSet.delete(projectTitle);
            } else {
                newSet.add(projectTitle);
            }
            return newSet;
        });

        // Track both additions and removals in pendingChanges
        setPendingChanges(prev => {
            const project = filteredAndSortedData.find(p => p.projectTitle === projectTitle);
            const isInPriority = priorityList.some(p => p.projectTitle === projectTitle);

            if (selectedProjects.has(projectTitle)) {
                // If unchecking and project is in priority list, add a remove change
                if (isInPriority) {
                    return [...prev.filter(change => change.project.projectTitle !== projectTitle),
                    { type: 'remove', project }];
                }
                // If unchecking and project wasn't going to be added, remove any pending change
                return prev.filter(change => change.project.projectTitle !== projectTitle);
            } else {
                // If checking and project isn't in priority list, add an add change
                if (!isInPriority) {
                    return [...prev.filter(change => change.project.projectTitle !== projectTitle),
                    { type: 'add', project }];
                }
                // If checking and project is already in priority list, remove any pending change
                return prev.filter(change => change.project.projectTitle !== projectTitle);
            }
        });
    }, [filteredAndSortedData, priorityList, selectedProjects]);

    // Update priority list handler
    const handleUpdatePriority = useCallback(() => {
        setPriorityList(prev => {
            let newList = [...prev];

            // Handle removals first
            pendingChanges.forEach(change => {
                if (change.type === 'remove') {
                    newList = newList.filter(p => p.projectTitle !== change.project.projectTitle);
                }
            });

            // Then handle additions
            pendingChanges.forEach(change => {
                if (change.type === 'add') {
                    newList.push(change.project);
                }
            });

            // Recalculate positions for all items
            return newList.map((project, index) => ({
                ...project,
                position: index + 1 // Position is 1-based
            }));
        });

        setPendingChanges([]);
    }, [pendingChanges]);

    // Move "Clear All Filters" to header
    const FiltersHeader = ({ clearFilters }) => {
        // Get active filter count with detailed breakdown
        const getActiveFilterCount = () => {
            const { searchTerm, supervisors, departments, fields, eligibleDepts } = multiFilters;

            // Create an object to store counts for each filter type
            const filterCounts = {
                search: searchTerm.trim() ? 1 : 0,
                supervisors: supervisors.size,
                departments: departments.size,
                fields: fields.size,
                eligibleDepts: eligibleDepts.size
            };

            // Calculate total count
            const totalCount = Object.values(filterCounts).reduce((a, b) => a + b, 0);

            return {
                total: totalCount,
                breakdown: filterCounts
            };
        };

        const filterStats = getActiveFilterCount();
        const hasActiveFilters = filterStats.total > 0;

        return (
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-700">
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-2 text-sm text-gray-500">
                            (
                            {filterStats.breakdown.search > 0 && `Search: ${filterStats.breakdown.search}`}
                            {filterStats.breakdown.supervisors > 0 &&
                                `${filterStats.breakdown.search ? ', ' : ''}Supervisors: ${filterStats.breakdown.supervisors}`}
                            {filterStats.breakdown.departments > 0 &&
                                `${(filterStats.breakdown.search || filterStats.breakdown.supervisors) ? ', ' : ''}Departments: ${filterStats.breakdown.departments}`}
                            {filterStats.breakdown.fields > 0 &&
                                `${(filterStats.breakdown.search || filterStats.breakdown.supervisors || filterStats.breakdown.departments) ? ', ' : ''}Fields: ${filterStats.breakdown.fields}`}
                            {filterStats.breakdown.eligibleDepts > 0 &&
                                `${(filterStats.breakdown.search || filterStats.breakdown.supervisors || filterStats.breakdown.departments || filterStats.breakdown.fields) ? ', ' : ''}Eligible: ${filterStats.breakdown.eligibleDepts}`}
                            )
                        </span>
                    )}
                </h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={clearFilters}
                        disabled={!hasActiveFilters}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${hasActiveFilters
                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            : 'text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Clear All {hasActiveFilters && `(${filterStats.total})`}
                    </button>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 rounded-lg shadow-sm transition-all 
                            bg-white/90 border hover:bg-gray-50/90"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    };

    // Update Header component with improved layout
    const Header = ({
        filteredAndSortedData,
        exportToExcel,
        setShowPriorityList,
        handleUpdatePriority,
        pendingChanges,
        clearFilters,
        multiFilters,
        setMultiFilters,
        setShowFilters,
        showFilters,
        setShowWhatsAppConfirmation,
        priorityList
    }) => {
        const [searchInput, setSearchInput] = useState(multiFilters.searchTerm);

        // Calculate active filters and counts
        const { hasActiveFilters, filterCounts } = useMemo(() => {
            const { searchTerm, supervisors, departments, fields, eligibleDepts } = multiFilters;

            const counts = {
                search: searchTerm.trim() ? 1 : 0,
                supervisors: supervisors.size,
                departments: departments.size,
                fields: fields.size,
                eligibleDepts: eligibleDepts.size
            };

            const total = Object.values(counts).reduce((a, b) => a + b, 0);

            return {
                hasActiveFilters: total > 0,
                filterCounts: {
                    total,
                    ...counts
                }
            };
        }, [multiFilters]);

        const applySearch = useCallback(() => {
            setMultiFilters(prev => ({ ...prev, searchTerm: searchInput }));
        }, [searchInput, setMultiFilters]);

        const handleSearchButton = useCallback(() => {
            if (multiFilters.searchTerm || hasActiveFilters) {
                // Clear both search and filters
                setSearchInput('');
                setMultiFilters({
                    supervisors: new Set(),
                    departments: new Set(),
                    fields: new Set(),
                    eligibleDepts: new Set(),
                    searchTerm: ''
                });
            }
        }, [multiFilters.searchTerm, hasActiveFilters, setMultiFilters]);

        const handleSearchChange = useCallback((e) => {
            setSearchInput(e.target.value);
        }, []);

        const handleKeyPress = useCallback((e) => {
            if (e.key === 'Enter') {
                applySearch();
            }
        }, [applySearch]);

        return (
            <header className="sticky top-0 z-30 shadow-lg rounded-xl mb-6 mx-2 bg-white/90 border border-gray-200 backdrop-blur-lg">
                <div className="px-6 py-4">
                    <div className="flex items-center gap-6">
                        {/* Stats section - fixed width */}
                        <div className="flex items-center space-x-4 text-sm text-gray-500 min-w-[200px]">
                            <span>Projects: {filteredAndSortedData.length}</span>
                            <span>•</span>
                            <span>Last Updated: 1/6/2025 2:05:03 PM</span>
                        </div>

                        {/* Search section - flexible width */}
                        <div className="flex items-center gap-4 flex-1 max-w-2xl">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    className="pl-10 w-full py-2.5 px-4 text-base rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyPress}
                                />
                            </div>
                            {(multiFilters.searchTerm || hasActiveFilters) && (
                                <Tooltip
                                    text="Clear All"
                                    description="Clear all search terms and filters"
                                >
                                    <button
                                        onClick={handleSearchButton}
                                        className="px-4 py-2.5 text-base font-medium rounded-lg transition-colors min-w-[100px] 
                                            text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200"
                                    >
                                        Clear All
                                    </button>
                                </Tooltip>
                            )}
                        </div>

                        {/* Action buttons section - fixed width with consistent spacing */}
                        <div className="flex items-center gap-4 ml-auto">
                            <Tooltip
                                text="Need assistance?"
                                description="Contact me via WhatsApp for help with using the system or reporting issues"
                            >
                                <button
                                    onClick={() => setShowWhatsAppConfirmation(true)}
                                    className="px-6 py-2.5 text-base bg-white border hover:bg-gray-50 rounded-lg flex items-center gap-2 whitespace-nowrap"
                                >
                                    Help
                                </button>
                            </Tooltip>
                            <Tooltip
                                text="Export to Excel"
                                description="Download the current filtered list of projects as an Excel spreadsheet"
                            >
                                <button
                                    onClick={() => exportToExcel(filteredAndSortedData, 'thesis_projects.xlsx')}
                                    disabled={isLoading}
                                    className={`px-6 py-2.5 text-base whitespace-nowrap ${isLoading
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600'
                                        } text-white rounded-lg`}
                                >
                                    {isLoading ? 'Exporting...' : 'Export'}
                                </button>
                            </Tooltip>
                            <Tooltip
                                text="View Priority List"
                                description="Access your saved priority list of selected projects"
                            >
                                <button
                                    onClick={() => setShowPriorityList(true)}
                                    className="px-6 py-2.5 text-base bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap"
                                >
                                    Priority {priorityList.length > 0 && `(${priorityList.length})`}
                                </button>
                            </Tooltip>
                            <Tooltip
                                text="Update Priority List"
                                description="Apply pending changes to your priority list"
                            >
                                <button
                                    onClick={handleUpdatePriority}
                                    disabled={pendingChanges.length === 0}
                                    className={`px-6 py-2.5 text-base rounded-lg whitespace-nowrap ${pendingChanges.length === 0
                                        ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                        }`}
                                >
                                    Update Priority ({pendingChanges.length})
                                </button>
                            </Tooltip>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-6 py-2.5 text-base bg-white border rounded-lg flex items-center gap-2 whitespace-nowrap"
                            >
                                <Filter className="h-4 w-4" />
                                Filters {hasActiveFilters && `(${filterCounts.total})`}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        );
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                if (showPriorityList) {
                    setShowPriorityList(false);
                } else if (showFilters) {
                    setShowFilters(false);
                }
            }
        };

        const handlePopState = () => {
            if (showPriorityList) {
                setShowPriorityList(false);
            } else if (showFilters) {
                setShowFilters(false);
            }
        };

        window.addEventListener('popstate', handlePopState);
        document.addEventListener('keydown', handleEscape);

        return () => {
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [showPriorityList, showFilters]);

    // Update useEffect to watch for filter and sort changes
    useEffect(() => {
        // Only clear expanded rows if filters change, not on initial load
        if (Object.values(multiFilters).some(filter =>
            filter instanceof Set ? filter.size > 0 : filter !== '')) {
            setExpandedRows(new Set());
        }
    }, [multiFilters, sortConfig]);

    // Reset selected projects to match priority list when opening modal
    useEffect(() => {
        if (showPriorityList) {
            setSelectedProjects(new Set(priorityList.map(project => project.projectTitle)));
            setPendingChanges([]); // Clear any pending changes
        }
    }, [showPriorityList, priorityList]);

    // Add handler for check all functionality
    const handleCheckAll = useCallback(() => {
        if (filteredAndSortedData.every(project => selectedProjects.has(project.projectTitle))) {
            // If all filtered items are selected, unselect all items (not just filtered ones)
            setSelectedProjects(new Set());
            setPendingChanges(priorityList.map(project => ({
                type: 'remove',
                project
            })));
        } else {
            // Select all filtered projects
            const newSelected = new Set(filteredAndSortedData.map(project => project.projectTitle));
            setSelectedProjects(newSelected);

            // Calculate pending changes
            const newChanges = [];

            // Add 'remove' changes for existing priority items not in filtered data
            priorityList.forEach(project => {
                if (!filteredAndSortedData.some(p => p.projectTitle === project.projectTitle)) {
                    newChanges.push({ type: 'remove', project });
                }
            });

            // Add 'add' changes for new selections
            filteredAndSortedData.forEach(project => {
                if (!priorityList.some(p => p.projectTitle === project.projectTitle)) {
                    newChanges.push({ type: 'add', project });
                }
            });

            setPendingChanges(newChanges);
        }
    }, [filteredAndSortedData, selectedProjects, priorityList]);

    // Add useEffect to save selectedProjects
    useEffect(() => {
        try {
            localStorage.setItem('selectedProjects', JSON.stringify(Array.from(selectedProjects)));
        } catch (error) {
            console.error('Error saving selected projects:', error);
        }
    }, [selectedProjects]);

    if (isMobile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
                <div className="text-center max-w-md">
                    <div className="mb-6 text-red-500">
                        <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Mobile Access Restricted
                    </h1>
                    <p className="text-gray-600 mb-6">
                        This application is optimized for desktop use only. Please access it from a computer for the best experience.
                    </p>
                    <div className="p-4 bg-yellow-50 rounded-lg text-yellow-700 text-sm">
                        The complex nature of the thesis comparison system requires a larger screen for optimal functionality and readability.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 mx-auto max-w-8xl bg-gradient-to-br from-gray-50/90 to-blue-50/90">
            <Header
                filteredAndSortedData={filteredAndSortedData}
                exportToExcel={exportToExcel}
                setShowPriorityList={setShowPriorityList}
                handleUpdatePriority={handleUpdatePriority}
                pendingChanges={pendingChanges}
                clearFilters={clearFilters}
                multiFilters={multiFilters}
                setMultiFilters={setMultiFilters}
                setShowFilters={setShowFilters}
                showFilters={showFilters}
                setShowWhatsAppConfirmation={setShowWhatsAppConfirmation}
                priorityList={priorityList}
            />

            {/* Move the filters modal after the header */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) {
                                setShowFilters(false);
                            }
                        }}
                    >
                        <div className="min-h-screen flex items-start justify-end">
                            <div className="h-screen p-6 w-[500px] bg-white/90 backdrop-blur-lg border-l border-gray-200">
                                <FiltersHeader clearFilters={clearFilters} />
                                <div className="grid grid-cols-1 gap-6">
                                    <FilterDropdown
                                        label="Supervisors"
                                        options={uniqueValues.supervisors}
                                        selected={multiFilters.supervisors}
                                        onChange={(value) => handleMultiFilterChange('supervisors', value)}
                                        className="hover:shadow-md"
                                    />
                                    <FilterDropdown
                                        label="Departments"
                                        options={uniqueValues.departments}
                                        selected={multiFilters.departments}
                                        onChange={(value) => handleMultiFilterChange('departments', value)}
                                        className="hover:shadow-md"
                                    />
                                    <FilterDropdown
                                        label="Research Fields"
                                        options={uniqueValues.fields}
                                        selected={multiFilters.fields}
                                        onChange={(value) => handleMultiFilterChange('fields', value)}
                                        className="hover:shadow-md"
                                    />
                                    <FilterDropdown
                                        label="Eligible Departments"
                                        options={uniqueValues.eligibleDepts}
                                        selected={multiFilters.eligibleDepts}
                                        onChange={(value) => handleMultiFilterChange('eligibleDepts', value)}
                                        className="hover:shadow-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className={`rounded-xl shadow-lg mx-2 mb-2 flex-1 bg-white/80 border-gray-200`}>
                <div className="relative h-[calc(100vh-143px)]">
                    <div
                        ref={tableContainerRef}
                        className="absolute inset-0 overflow-auto"
                    >
                        <table className="w-full table-fixed">
                            <thead className="sticky top-0 z-40 shadow-sm backdrop-blur-lg bg-white/90 border-b border-gray-200">
                                <tr>
                                    <th className="w-[72px] px-4 py-3">
                                        <div className="flex items-center justify-start gap-2.5 pl-1">
                                            <Tooltip
                                                text={filteredAndSortedData.every(project => selectedProjects.has(project.projectTitle))
                                                    ? "Unselect All" : "Select All"}
                                                description={`Click to ${filteredAndSortedData.every(project => selectedProjects.has(project.projectTitle))
                                                    ? 'unselect' : 'select'} all visible projects`}
                                            >
                                                <div
                                                    onClick={handleCheckAll}
                                                    className={`cursor-pointer p-2 rounded-lg transition-all active:scale-95
                                                        ${filteredAndSortedData.every(project => selectedProjects.has(project.projectTitle))
                                                            ? 'hover:bg-red-50 active:bg-red-100'
                                                            : 'hover:bg-blue-50 active:bg-blue-100'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={filteredAndSortedData.length > 0 &&
                                                            filteredAndSortedData.every(project =>
                                                                selectedProjects.has(project.projectTitle)
                                                            )}
                                                        indeterminate={filteredAndSortedData.some(project =>
                                                            selectedProjects.has(project.projectTitle)
                                                        ) && !filteredAndSortedData.every(project =>
                                                            selectedProjects.has(project.projectTitle)
                                                        )}
                                                        onChange={() => { }} // Handled by div onClick
                                                        className={`rounded w-4 h-4 cursor-pointer transition-all focus:ring-2
                                                            ${filteredAndSortedData.every(project => selectedProjects.has(project.projectTitle))
                                                                ? 'hover:border-red-500 focus:ring-red-500'
                                                                : 'hover:border-blue-500 focus:ring-blue-500'
                                                            }`}
                                                    />
                                                </div>
                                            </Tooltip>
                                        </div>
                                    </th>
                                    <SortableHeader title="Supervisor(s)" sortKey="supervisorName" sortConfig={sortConfig} handleSort={handleSort} className="w-[22%]" />
                                    <SortableHeader title="Project Title" sortKey="projectTitle" sortConfig={sortConfig} handleSort={handleSort} className="w-[30%]" />
                                    <th className={`w-[16%] px-4 py-3 text-left`}>Research Field</th>
                                    <th className={`w-[16%] px-4 py-3 text-left`}>Department</th>
                                    <th className={`w-[16%] px-4 py-3 text-left`}>Eligibility</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {filteredAndSortedData.map((project, index) => (
                                    <React.Fragment key={`${project.projectTitle}-${index}`}>
                                        <tr
                                            onClick={(e) => {
                                                // Only expand if not clicking the checkbox area
                                                if (!e.target.closest('.checkbox-area')) {
                                                    setExpandedRows((prev) => {
                                                        const newSet = new Set(prev);
                                                        if (prev.has(index)) {
                                                            newSet.delete(index);
                                                        } else {
                                                            newSet.add(index);
                                                        }
                                                        return newSet;
                                                    });
                                                }
                                            }}
                                            className={`cursor-pointer hover:bg-gray-50/80 transition-colors group`}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-start gap-2.5 pl-1 checkbox-area">
                                                    <Tooltip
                                                        text="Add to Priority List"
                                                        description="Select this project to add it to your priority list"
                                                    >
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleProjectSelection(project.projectTitle);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedProjects.has(project.projectTitle)}
                                                                onChange={() => { }} // Handled by div onClick
                                                                className="rounded w-3.5 h-3.5"
                                                            />
                                                        </div>
                                                    </Tooltip>
                                                    <Tooltip
                                                        text={expandedRows.has(index) ? "Hide Details" : "Show Details"}
                                                        description={expandedRows.has(index)
                                                            ? "Click to collapse project details"
                                                            : "Click to expand and view full project details"}
                                                    >
                                                        <motion.div
                                                            animate={{ rotate: expandedRows.has(index) ? 180 : 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <ChevronDown className="h-4 w-4 text-gray-600" />
                                                        </motion.div>
                                                    </Tooltip>
                                                </div>
                                            </td>
                                            <td className={`px-4 py-4`}>
                                                <div className="text-sm">
                                                    <HighlightedText
                                                        text={project.supervisorName}
                                                        searchTerm={debouncedSearchTerm}
                                                    />
                                                    {project.coSupervisor && (
                                                        <>
                                                            <br />
                                                            <HighlightedText
                                                                text={project.coSupervisor}
                                                                searchTerm={debouncedSearchTerm}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                                <div className={`text-sm text-gray-600`}>
                                                    <HighlightedText
                                                        text={project.supervisorEmail}
                                                        searchTerm={debouncedSearchTerm}
                                                    />
                                                    {project.coSupervisorEmail && (
                                                        <>
                                                            <br />
                                                            <HighlightedText
                                                                text={project.coSupervisorEmail}
                                                                searchTerm={debouncedSearchTerm}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={`px-4 py-4`}>
                                                <HighlightedText
                                                    text={project.projectTitle}
                                                    searchTerm={debouncedSearchTerm}
                                                />
                                            </td>
                                            <td className={`px-4 py-4`}>
                                                <HighlightedText
                                                    text={project.researchField}
                                                    searchTerm={debouncedSearchTerm}
                                                />
                                            </td>
                                            <td className={`px-4 py-4`}>
                                                <HighlightedText
                                                    text={project.department}
                                                    searchTerm={debouncedSearchTerm}
                                                />
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {(project.eligibleDepartments || []).map((dept) => (
                                                        <span
                                                            key={dept}
                                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            bg-emerald-50/90 text-emerald-700`}
                                                        >
                                                            <HighlightedText
                                                                text={dept}
                                                                searchTerm={debouncedSearchTerm}
                                                            />
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                        <AnimatePresence>
                                            {expandedRows.has(index) && (
                                                <motion.tr
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <td colSpan="6" className={`px-4 py-4 bg-gray-50/80`}>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <Card className="">
                                                                <CardContent>
                                                                    <h3 className={`font-medium mb-2 text-gray-900`}>
                                                                        Project Description
                                                                    </h3>
                                                                    <div className={`text-sm text-gray-600 whitespace-pre-line`}>
                                                                        <HighlightedText
                                                                            text={project.projectDescription}
                                                                            searchTerm={debouncedSearchTerm}
                                                                        />
                                                                    </div>
                                                                </CardContent>
                                                            </Card>

                                                            <Card className="">
                                                                <CardContent>
                                                                    <h3 className={`font-medium mb-2 text-gray-900`}>
                                                                        Project Methodology
                                                                    </h3>
                                                                    <div className={`text-sm text-gray-600 whitespace-pre-line`}>
                                                                        <HighlightedText
                                                                            text={Array.isArray(project.projectMethodology)
                                                                                ? project.projectMethodology.join('\n')
                                                                                : project.projectMethodology}
                                                                            searchTerm={debouncedSearchTerm}
                                                                        />
                                                                    </div>
                                                                </CardContent>
                                                            </Card>

                                                            <Card className="">
                                                                <CardContent>
                                                                    <h3 className={`font-medium mb-2 text-gray-900`}>
                                                                        Required Qualifications
                                                                    </h3>
                                                                    <div className={`text-sm text-gray-600 whitespace-pre-line`}>
                                                                        <HighlightedText
                                                                            text={Array.isArray(project.qualifications)
                                                                                ? project.qualifications.join('\n')
                                                                                : project.qualifications}
                                                                            searchTerm={debouncedSearchTerm}
                                                                        />
                                                                    </div>
                                                                </CardContent>
                                                            </Card>

                                                            <Card className="">
                                                                <CardContent>
                                                                    <h3 className={`font-medium mb-2 text-gray-900`}>
                                                                        Additional Comments
                                                                    </h3>
                                                                    <div className={`text-sm text-gray-600 whitespace-pre-line`}>
                                                                        <HighlightedText
                                                                            text={project.furtherComments}
                                                                            searchTerm={debouncedSearchTerm}
                                                                        />
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {showPriorityList && (
                <PriorityListModal
                    priorityList={priorityList}
                    setPriorityList={setPriorityList}
                    setShowPriorityList={setShowPriorityList}
                    setShowClearConfirmation={setShowClearConfirmation}
                    exportToExcel={exportToExcel}
                    setSelectedProjects={setSelectedProjects}
                    setToast={setToast}
                />
            )}

            <ConfirmationModal
                isOpen={showClearConfirmation}
                onClose={() => setShowClearConfirmation(false)}
                onConfirm={clearPriorityList}
                message="Are you sure you want to clear the priority list? This action cannot be undone."
            />

            <ConfirmationModal
                isOpen={showWhatsAppConfirmation}
                onClose={() => setShowWhatsAppConfirmation(false)}
                onConfirm={handleWhatsAppHelp}
                message="You will be redirected to WhatsApp to contact support. Continue?"
            />

            <AnimatePresence>
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}