import React, { useState, useRef, useCallback } from 'react';
import { Trash2, X } from 'lucide-react';
import ProjectDetailsPopup from './ProjectDetailsPopup';
import useModalClose from '../hooks/useModalClose';

const PriorityListModal = ({
    priorityList,
    setPriorityList,
    setShowPriorityList,
    setShowClearConfirmation,
    exportToExcel,
    setSelectedProjects,
    setToast
}) => {
    useModalClose(true, () => setShowPriorityList(false));
    const [selectedProject, setSelectedProject] = useState(null);
    const [draggingIndex, setDraggingIndex] = useState(null);
    const dragProject = useRef(null);
    const draggedOverProject = useRef(null);
    const lastClickTime = useRef(0);

    // Simple drag and drop sorting - no position tracking needed
    const handleSort = useCallback(() => {
        if (dragProject.current === null || draggedOverProject.current === null) return;

        setPriorityList(prevList => {
            const newList = [...prevList];
            const draggedItem = newList[dragProject.current];

            // Remove the dragged item
            newList.splice(dragProject.current, 1);
            // Insert it at the new position
            newList.splice(draggedOverProject.current, 0, draggedItem);

            return newList;
        });

        // Reset drag refs
        dragProject.current = null;
        draggedOverProject.current = null;
        setDraggingIndex(null);
    }, [setPriorityList]);

    // Remove from priority list
    const removeFromPriorityList = useCallback((projectTitle) => {
        setPriorityList(prev => prev.filter(p => p.projectTitle !== projectTitle));
        setSelectedProjects(prev => {
            const newSet = new Set(prev);
            newSet.delete(projectTitle);
            return newSet;
        });
    }, [setPriorityList, setSelectedProjects]);

    // Add this handler for double-click
    const handleProjectClick = useCallback((project) => {
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastClickTime.current;

        if (timeDiff < 300) { // Double-click threshold of 300ms
            setSelectedProject(project);
        }

        lastClickTime.current = currentTime;
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) setShowPriorityList(false);
            }}
        >
            <div className="rounded-xl w-full md:w-4/5 lg:w-3/4 m-4 
                bg-white/90 backdrop-blur-lg border border-gray-200 flex flex-col max-h-[85vh]">
                {/* Header section */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-200">
                    <div className="flex justify-between items-center p-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Priority List ({priorityList.length})
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Double-click any project to view full details
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => exportToExcel(priorityList, 'priority_list.xlsx')}
                                className="px-6 py-2.5 text-base bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                            >
                                Export List
                            </button>
                            <button
                                onClick={() => setShowClearConfirmation(true)}
                                className="px-6 py-2.5 text-base bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                                Clear List
                            </button>
                            <button
                                onClick={() => setShowPriorityList(false)}
                                className="p-2.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* List content */}
                <div className="overflow-y-auto flex-1 p-3 space-y-2">
                    {Array.from({ length: priorityList.length }, (_, index) => (
                        <div
                            key={`cell-${index + 1}`}
                            className="relative"
                        >
                            {/* Fixed number cell */}
                            <div className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center 
                                border-r border-gray-200 bg-gray-50 rounded-l-lg select-none">
                                <span className="font-medium text-gray-500">
                                    {index + 1}
                                </span>
                            </div>

                            {/* Updated project content with double-click */}
                            <div
                                draggable
                                onDragStart={() => {
                                    dragProject.current = index;
                                    setDraggingIndex(index);
                                }}
                                onDragEnter={() => {
                                    draggedOverProject.current = index;
                                }}
                                onDragEnd={handleSort}
                                onDragOver={(e) => e.preventDefault()}
                                onClick={() => handleProjectClick(priorityList[index])}
                                className={`flex items-center gap-2 p-2.5 rounded-lg 
                                    ${draggingIndex === index ? 'bg-blue-50' : 'bg-gray-50 hover:bg-gray-100'} 
                                    border border-gray-200 transition-colors duration-200 cursor-move`}
                            >
                                {/* Spacer to account for fixed number width */}
                                <div className="w-12" />

                                {/* Project Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium text-gray-900 truncate">
                                            {priorityList[index]?.projectTitle}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500 truncate">
                                        {priorityList[index]?.supervisorName}
                                        {priorityList[index]?.coSupervisor &&
                                            `, ${priorityList[index]?.coSupervisor}`}
                                    </div>
                                </div>

                                <button
                                    onClick={() => removeFromPriorityList(priorityList[index]?.projectTitle)}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 
                                        transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add ProjectDetailsPopup */}
            {selectedProject && (
                <ProjectDetailsPopup
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </div>
    );
};

export { PriorityListModal };
export default PriorityListModal;
