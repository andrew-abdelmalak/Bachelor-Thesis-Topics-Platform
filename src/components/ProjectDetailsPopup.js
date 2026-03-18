import React from 'react';
import { X } from 'lucide-react';
import { Card, CardContent } from './Card';
import useModalClose from '../hooks/useModalClose';

export const ProjectDetailsPopup = React.memo(({ project, onClose }) => {
    useModalClose(true, onClose);

    if (!project) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="relative w-full max-w-4xl mx-4 rounded-lg shadow-xl overflow-y-auto max-h-[90vh] bg-white">
                <div className="p-6 relative">
                    <h2 className="text-2xl font-bold mb-4 pr-12">
                        {project.projectTitle}
                    </h2>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 p-2 rounded-lg transition-colors hover:bg-gray-100 z-10"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="">
                            <CardContent>
                                <h3 className={`font-medium mb-2 text-gray-900`}>
                                    Supervisor Information
                                </h3>
                                <div className={`text-sm text-gray-600`}>
                                    <p><strong>Supervisor:</strong> {project.supervisorName}</p>
                                    <p><strong>Email:</strong> {project.supervisorEmail}</p>
                                    {project.coSupervisor && (
                                        <>
                                            <p className="mt-2"><strong>Co-Supervisor:</strong> {project.coSupervisor}</p>
                                            <p><strong>Email:</strong> {project.coSupervisorEmail}</p>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="">
                            <CardContent>
                                <h3 className={`font-medium mb-2 text-gray-900`}>
                                    Department & Field
                                </h3>
                                <div className={`text-sm text-gray-600`}>
                                    <p><strong>Department:</strong> {project.department}</p>
                                    <p><strong>Research Field:</strong> {project.researchField}</p>
                                    <div className="mt-2">
                                        <strong>Eligible Departments:</strong>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {(project.eligibleDepartments || []).map((dept) => (
                                                <span
                                                    key={dept}
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            bg-emerald-50/90 text-emerald-700`}
                                                >
                                                    {dept}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="md:col-span-2">
                            <CardContent>
                                <h3 className={`font-medium mb-2 text-gray-900`}>
                                    Project Description
                                </h3>
                                <p className={`text-sm text-gray-600`}>
                                    {project.projectDescription}
                                </p>
                            </CardContent>
                        </Card>

                        {project.projectMethodology && (
                            <Card className="md:col-span-2">
                                <CardContent>
                                    <h3 className={`font-medium mb-2 text-gray-900`}>
                                        Project Methodology
                                    </h3>
                                    <div className={`text-sm text-gray-600 whitespace-pre-line`}>
                                        {Array.isArray(project.projectMethodology) ? (
                                            project.projectMethodology.join('\n')
                                        ) : (
                                            project.projectMethodology
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {project.qualifications && (
                            <Card className="md:col-span-2">
                                <CardContent>
                                    <h3 className={`font-medium mb-2 text-gray-900`}>
                                        Required Qualifications
                                    </h3>
                                    <div className={`text-sm text-gray-600 whitespace-pre-line`}>
                                        {Array.isArray(project.qualifications) ? (
                                            project.qualifications.join('\n')
                                        ) : (
                                            project.qualifications
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {project.furtherComments && (
                            <Card className="md:col-span-2">
                                <CardContent>
                                    <h3 className={`font-medium mb-2 text-gray-900`}>
                                        Additional Comments
                                    </h3>
                                    <p className={`text-sm text-gray-600`}>
                                        {project.furtherComments}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ProjectDetailsPopup;
