import React, { type ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { FileCode, FileText, Menu, HelpCircle, ChevronDown } from 'lucide-react';

interface LayoutProps {
    editor: ReactNode;
    preview: ReactNode;
    toolbar: ReactNode;
    projectName?: string;
}

export const Layout: React.FC<LayoutProps> = ({
    editor,
    preview,
    toolbar,
    projectName = "Untitled Resume"
}) => {
    return (
        <div className="app-container">
            {/* Navbar */}
            <nav className="navbar">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-600 rounded flex items-center justify-center text-black font-bold text-sm">
                        R
                    </div>
                    <span className="font-semibold text-white">ResuAI</span>
                </div>

                {/* Divider */}
                <div className="divider-v" />

                {/* Project Name */}
                <div className="flex items-center gap-1 cursor-pointer hover:bg-white/5 px-2 py-1 rounded">
                    <span className="text-sm text-[var(--text-primary)]">{projectName}</span>
                    <ChevronDown size={14} className="text-[var(--text-muted)]" />
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-1">
                    <button className="btn btn-icon">
                        <Menu size={18} />
                    </button>
                    <button className="btn btn-icon">
                        <HelpCircle size={18} />
                    </button>
                </div>
            </nav>

            {/* Toolbar */}
            <div className="toolbar">
                {toolbar}
            </div>

            {/* Main Content - Editor & Preview */}
            <div className="main-content">
                <PanelGroup direction="horizontal">
                    {/* Editor Panel */}
                    <Panel defaultSize={45} minSize={20} className="panel">
                        <div className="panel-header">
                            <div className="panel-title">
                                <FileCode size={14} className="text-[var(--accent-blue)]" />
                                <span>Source</span>
                            </div>
                        </div>
                        <div className="panel-content">
                            {editor}
                        </div>
                    </Panel>

                    {/* Resize Handle */}
                    <PanelResizeHandle className="resize-handle" />

                    {/* Preview Panel */}
                    <Panel defaultSize={55} minSize={25} className="panel">
                        <div className="panel-header">
                            <div className="panel-title">
                                <FileText size={14} className="text-[var(--accent-green)]" />
                                <span>PDF Preview</span>
                            </div>
                        </div>
                        <div className="panel-content">
                            {preview}
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};
