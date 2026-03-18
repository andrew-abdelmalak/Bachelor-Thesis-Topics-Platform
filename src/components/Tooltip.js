import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

const Tooltip = React.memo(({ text, description, children, position = 'bottom' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);

    const updatePosition = useCallback(() => {
        if (triggerRef.current && tooltipRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            let x = triggerRect.left + (triggerRect.width / 2);
            let y;

            if (position === 'bottom') {
                y = triggerRect.bottom + 8;
                if (y + tooltipRect.height > viewportHeight) {
                    y = triggerRect.top - tooltipRect.height - 8;
                }
            } else {
                y = triggerRect.top - tooltipRect.height - 8;
                if (y < 0) {
                    y = triggerRect.bottom + 8;
                }
            }

            if (x + (tooltipRect.width / 2) > viewportWidth) {
                x = viewportWidth - tooltipRect.width - 10;
            } else if (x - (tooltipRect.width / 2) < 0) {
                x = tooltipRect.width / 2 + 10;
            }

            setTooltipPosition({ x, y });
        }
    }, [position]);

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isVisible, updatePosition]);

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
            >
                {children}
            </div>
            {isVisible && ReactDOM.createPortal(
                <div
                    ref={tooltipRef}
                    style={{
                        position: 'fixed',
                        left: tooltipPosition.x,
                        top: tooltipPosition.y,
                        transform: 'translateX(-50%)',
                        zIndex: 999999
                    }}
                    className="pointer-events-none"
                >
                    <div className="relative px-4 py-2 rounded-lg shadow-lg bg-gray-900 text-white text-sm whitespace-nowrap">
                        <div className="font-medium mb-1">{text}</div>
                        {description && (
                            <div className="text-gray-300 text-xs max-w-xs whitespace-normal">
                                {description}
                            </div>
                        )}
                        <div
                            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent
                                ${position === 'bottom' ? 'top-0 -mt-1 border-b-gray-900 rotate-180' : 'bottom-0 -mb-1 border-t-gray-900'}`}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
});

export default Tooltip;
