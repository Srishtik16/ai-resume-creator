import React from 'react';
import { FileText, Loader2 } from 'lucide-react';

interface PreviewProps {
    pdfUrl: string | null;
    isLoading: boolean;
}

export const Preview: React.FC<PreviewProps> = ({ pdfUrl, isLoading }) => {
    if (isLoading) {
        return (
            <div className="pdf-container">
                <div className="pdf-placeholder">
                    <div className="spinner text-[var(--accent-blue)]" style={{ width: 32, height: 32 }} />
                    <span className="text-sm">Compiling...</span>
                </div>
            </div>
        );
    }

    if (!pdfUrl) {
        return (
            <div className="pdf-container">
                <div className="pdf-placeholder">
                    <div className="pdf-placeholder-icon">
                        <FileText size={24} />
                    </div>
                    <span className="text-sm">No PDF generated yet</span>
                    <span className="text-xs text-[var(--text-muted)]">Click Recompile to generate</span>
                </div>
            </div>
        );
    }

    return (
        <div className="pdf-container">
            <iframe
                src={pdfUrl}
                className="pdf-viewer"
                title="PDF Preview"
            />
        </div>
    );
};
