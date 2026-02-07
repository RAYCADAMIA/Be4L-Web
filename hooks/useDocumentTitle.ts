import { useEffect } from 'react';

/**
 * Custom hook to update the document title.
 * @param title The descriptive part of the title.
 * @param prefix The brand prefix (defaults to 'Be4L').
 */
export const useDocumentTitle = (title: string, prefix: string = 'Be4L') => {
    useEffect(() => {
        const fullTitle = title ? `${prefix} | ${title}` : prefix;
        document.title = fullTitle;

        // Optional: Clean up title on unmount if needed, 
        // though usually navigation will trigger another update.
    }, [title, prefix]);
};
