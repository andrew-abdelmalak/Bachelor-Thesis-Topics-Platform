import React from 'react';

const HighlightedText = React.memo(({ text = "", searchTerm = "" }) => {
    if (!searchTerm || typeof text !== 'string') return <>{text}</>;

    const parts = [];
    let lastIndex = 0;
    let index = text.toLowerCase().indexOf(searchTerm.toLowerCase());

    while (index !== -1) {
        parts.push(text.slice(lastIndex, index));
        parts.push(
            <span className="bg-yellow-50/90 text-yellow-700 rounded px-1">
                {text.slice(index, index + searchTerm.length)}
            </span>,
        );
        lastIndex = index + searchTerm.length;
        index = text.toLowerCase().indexOf(searchTerm.toLowerCase(), lastIndex);
    }

    parts.push(text.slice(lastIndex));

    return <>{parts}</>;
});

export default HighlightedText;
