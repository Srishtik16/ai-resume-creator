package services

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

func CompileLatex(latexCode string) ([]byte, error) {
	// Create a temporary directory for this compilation
	tmpDir, err := os.MkdirTemp("", "resume_compile_*")
	if err != nil {
		return nil, fmt.Errorf("failed to create temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir) // Clean up

	// Write main.tex
	texFile := filepath.Join(tmpDir, "main.tex")
	if err := os.WriteFile(texFile, []byte(latexCode), 0644); err != nil {
		return nil, fmt.Errorf("failed to write tex file: %w", err)
	}

	// Run pdflatex
	// -interaction=nonstopmode prevents it from asking for input on error
	// -output-directory ensures we know where the PDF goes
	cmd := exec.Command("pdflatex", "-interaction=nonstopmode", "-output-directory", tmpDir, texFile)
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("pdflatex compilation failed:\n%s\n", string(output))
		// If compilation fails, return the output (logs) so the user can see what went wrong
		return nil, fmt.Errorf("pdflatex failed: %s\nOutput:\n%s", err, string(output))
	}

	// Read the generated PDF
	pdfFile := filepath.Join(tmpDir, "main.pdf")
	pdfBytes, err := os.ReadFile(pdfFile)
	if err != nil {
		return nil, fmt.Errorf("failed to read generated pdf: %w", err)
	}

	return pdfBytes, nil
}
