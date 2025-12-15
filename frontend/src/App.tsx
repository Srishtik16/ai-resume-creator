import { useState, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { CodeEditor } from './components/editor/CodeEditor';
import { Preview } from './components/editor/Preview';
import { Play, CloudUpload, Download, Share2, Send, Sparkles } from 'lucide-react';

const DEFAULT_LATEX = `\\documentclass{article}
\\usepackage{titlesec}
\\usepackage{titling}
\\usepackage[margin=1in]{geometry}

\\titleformat{\\section}
{\\large\\bfseries}
{}
{0em}
{}

\\renewcommand{\\maketitle}{
    \\begin{center}
        {\\huge\\bfseries John Doe} \\\\
        \\vspace{0.5em}
        john.doe@email.com | (555) 123-4567 | San Francisco, CA
    \\end{center}
}

\\begin{document}

\\maketitle

\\section{Summary}
Experienced software engineer with 5+ years building scalable web applications and distributed systems.

\\section{Experience}
\\textbf{Senior Software Engineer} \\hfill 2021 - Present \\\\
\\textit{Tech Company Inc.} \\\\
\\begin{itemize}
    \\item Led development of microservices architecture serving 1M+ daily users
    \\item Reduced API latency by 40\\% through optimization and caching strategies
    \\item Mentored team of 4 junior developers
\\end{itemize}

\\section{Education}
\\textbf{Stanford University} \\hfill 2017 \\\\
B.S. in Computer Science

\\section{Skills}
Python, TypeScript, Go, React, Node.js, PostgreSQL, Redis, AWS, Docker, Kubernetes

\\end{document}
`;

// Environment variable for API URL (defaults to localhost if not set)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function App() {
  const [code, setCode] = useState<string>(DEFAULT_LATEX);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compile Handler
  const handleCompile = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/resume/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latex_code: code }),
      });

      if (!response.ok) {
        const errText = await response.text();
        alert(`Compilation Error: ${errText}`);
        setIsLoading(false);
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error("Compile error", error);
      alert("Failed to connect to backend");
    } finally {
      setIsLoading(false);
    }
  }, [code]);

  // AI Generate Handler
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/resume/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, current_latex: code }),
      });

      const data = await response.json();
      if (data.latex) {
        setCode(data.latex);
      }
    } catch (error) {
      console.error("AI Generation error", error);
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };

  // Upload Handler
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsGenerating(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/resume/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.text();
        alert("Upload failed: " + err);
        return;
      }

      const data = await response.json();
      if (data.latex) {
        setCode(data.latex);
      }
    } catch (error) {
      console.error("Upload error", error);
      alert("Failed to upload/convert resume");
    } finally {
      setIsGenerating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Toolbar with inline AI prompt
  const Toolbar = (
    <>
      {/* Left: Compile Actions */}
      <button
        onClick={handleCompile}
        disabled={isLoading}
        className="btn btn-compile"
      >
        {isLoading ? (
          <div className="spinner" />
        ) : (
          <Play size={14} fill="currentColor" />
        )}
        <span>Recompile</span>
      </button>

      {/* Divider */}
      <div className="divider-v" />

      {/* AI Prompt Input */}
      <div className="relative flex items-center">
        <Sparkles size={14} className="absolute left-3 text-[var(--accent-purple)]" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleGenerate();
            }
          }}
          placeholder="Ask AI to edit your resume..."
          className="input-ai"
          style={{ paddingLeft: '32px' }}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="btn btn-icon absolute right-1"
          style={{ padding: '4px' }}
        >
          {isGenerating ? (
            <div className="spinner" style={{ width: 14, height: 14 }} />
          ) : (
            <Send size={14} />
          )}
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: File Actions */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        className="hidden"
        accept=".pdf,.docx,.doc"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="btn btn-secondary"
      >
        <CloudUpload size={14} />
        <span>Upload</span>
      </button>

      <button
        onClick={() => pdfUrl && window.open(pdfUrl, '_blank')}
        disabled={!pdfUrl}
        className="btn btn-secondary"
      >
        <Download size={14} />
        <span>Download</span>
      </button>

      <button
        className="btn btn-secondary"
      >
        <Share2 size={14} />
        <span>Share</span>
      </button>
    </>
  );

  return (
    <Layout
      editor={<CodeEditor code={code} onChange={setCode} />}
      preview={<Preview pdfUrl={pdfUrl} isLoading={isLoading} />}
      toolbar={Toolbar}
      projectName="My Resume"
    />
  );
}

export default App;
