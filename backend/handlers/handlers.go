package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/srishtikdutta/ai_resume_creator/backend/services"
)

type Handler struct {
	aiService *services.AIService
}

func NewHandler(aiService *services.AIService) *Handler {
	return &Handler{
		aiService: aiService,
	}
}

type CompileRequest struct {
	LatexCode string `json:"latex_code"`
}

type GenerateRequest struct {
	Prompt       string `json:"prompt"`
	CurrentLatex string `json:"current_latex"`
}

func (h *Handler) CompileResume(w http.ResponseWriter, r *http.Request) {
	var req CompileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	pdfBytes, err := services.CompileLatex(req.LatexCode)
	if err != nil {
		http.Error(w, "Compilation failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/pdf")
	w.Write(pdfBytes)
}

func (h *Handler) GenerateResume(w http.ResponseWriter, r *http.Request) {
	var req GenerateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	latexCode, err := h.aiService.GenerateLatex(req.Prompt, req.CurrentLatex)
	if err != nil {
		http.Error(w, "AI Generation failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]string{
		"latex": latexCode,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *Handler) UploadResume(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Received Upload Request")
	// Parse multipart form (max 10MB)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		fmt.Printf("Error parsing multipart form: %v\n", err)
		http.Error(w, "File too large or invalid multipart", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("resume")
	if err != nil {
		fmt.Printf("Error retrieving file 'resume': %v\n", err)
		http.Error(w, "Failed to get file 'resume'", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fmt.Printf("File Uploaded: %s, Size: %d, HeaderContentType: %s\n", header.Filename, header.Size, header.Header.Get("Content-Type"))

	// Read file bytes
	fileBytes := make([]byte, header.Size)
	_, err = file.Read(fileBytes)
	if err != nil {
		fmt.Printf("Error reading file bytes: %v\n", err)
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	// Use http.DetectContentType for better accuracy if header is generic
	detectedMime := http.DetectContentType(fileBytes)
	fmt.Printf("Detected MIME: %s\n", detectedMime)

	// If detected is octet-stream (common for some docs), generic text, or application/zip (docx),
	// rely on the header or extension mapping if needed.
	// Gemini checks MIME provided in Blob.
	// Let's pass the header MIME if it looks plausible or detected one.
	finalMime := header.Header.Get("Content-Type")
	if finalMime == "" {
		finalMime = detectedMime
	}
	fmt.Printf("Using MIME for AI: %s\n", finalMime)

	latexCode, err := h.aiService.ConvertDocumentToLatex(fileBytes, finalMime)
	if err != nil {
		fmt.Printf("AI Conversion Error: %v\n", err)
		http.Error(w, "AI Conversion failed: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fmt.Println("AI Conversion Successful, returning response")

	response := map[string]string{
		"latex": latexCode,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
