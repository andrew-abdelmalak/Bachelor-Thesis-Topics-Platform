import React from 'react';

export const Card = React.memo(({ children, className = "" }) => (
    <div
        className={`p-6 shadow-sm rounded-xl transition-all 
            bg-white/90 border border-gray-200 hover:border-blue-400 ${className}`}
    >
        {children}
    </div>
));

export const CardContent = React.memo(({ children }) => (
    <div className="space-y-4 text-gray-700">
        {children}
    </div>
));
