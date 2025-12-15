package services

import (
	"context"
	"fmt"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type AIService struct {
	client *genai.Client
}

func NewAIService(apiKey string) (*AIService, error) {
	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create genai client: %v", err)
	}
	return &AIService{
		client: client,
	}, nil
}

const systemPrompt = `You are a professional LaTeX Resume Expert.
Your goal is to help users create and update high-quality, ATS-friendly LaTeX resumes.
You will receive a user prompt and potentially some existing LaTeX code.
Output ONLY the valid LaTeX code for the resume. Do not output markdown code blocks.
Do not offer explanations unless the user explicitly asks for help or feedback in comments.
Ensure the LaTeX compiles correctly. Use standard packages.
CRITICAL INSTRUCTIONS:
1. Escape all LaTeX special characters in text (%, $, &). Example: "75\%".
2. Do NOT use the 'fontawesome5' or 'fontawesome' packages. Use text labels (e.g. "Phone:", "Email:") instead.
3. Do NOT use undefined custom environments like 'resumeitems'. Use standard 'itemize' or define your own environments in the preamble.
4. Ensure every \begin{...} has a matching \end{...}. 
5. The output MUST be a complete LaTeX document starting with \documentclass and ending with \end{document}.`

func (s *AIService) GenerateLatex(userPrompt string, currentLatex string) (string, error) {
	ctx := context.Background()
	model := s.client.GenerativeModel("gemini-2.5-flash")

	// Set system instruction
	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{genai.Text(systemPrompt)},
	}

	var parts []genai.Part
	if currentLatex != "" {
		parts = append(parts, genai.Text(fmt.Sprintf("Here is my current LaTeX resume code:\n\n%s", currentLatex)))
	}
	parts = append(parts, genai.Text(userPrompt))

	resp, err := model.GenerateContent(ctx, parts...)
	if err != nil {
		return "", fmt.Errorf("generate content error: %v", err)
	}

	return s.extractContent(resp)
}

func (s *AIService) ConvertDocumentToLatex(fileBytes []byte, mimeType string) (string, error) {
	fmt.Printf("AI Service: Converting document with MIME: %s, Bytes: %d\n", mimeType, len(fileBytes))
	ctx := context.Background()
	model := s.client.GenerativeModel("gemini-2.5-flash")

	// Prompt for conversion
	conversionPrompt := `Analyze the attached resume document. Extract all relevant information including personal details, summary, experience, education, skills, and projects.
    Then, format this information into a high-quality, professional LaTeX resume code.
    Use standard LaTeX packages. Ensure the layout is clean and professional.
    Output ONLY the valid LaTeX code. Do not output markdown code blocks.`

	model.SystemInstruction = &genai.Content{
		Parts: []genai.Part{genai.Text(systemPrompt)},
	}

	fmt.Println("AI Service: Sending request to Gemini...")
	resp, err := model.GenerateContent(ctx,
		genai.Text(conversionPrompt),
		genai.Blob{MIMEType: mimeType, Data: fileBytes},
	)
	if err != nil {
		fmt.Printf("AI Service: GenerateContent failed: %v\n", err)
		return "", fmt.Errorf("generate content error: %v", err)
	}

	return s.extractContent(resp)
}

func (s *AIService) extractContent(resp *genai.GenerateContentResponse) (string, error) {
	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no content generated")
	}

	content := ""
	for _, part := range resp.Candidates[0].Content.Parts {
		if txt, ok := part.(genai.Text); ok {
			content += string(txt)
		}
	}

	// Robust Extraction
	// 1. Try to find \documentclass and \end{document}
	start := strings.Index(content, "\\documentclass")
	end := strings.LastIndex(content, "\\end{document}")

	if start != -1 && end != -1 && end > start {
		// Found a valid block
		content = content[start : end+14] // 14 is len("\\end{document}")
	} else {
		// Fallback: Remove markdown code fences
		content = strings.TrimPrefix(content, "```latex")
		content = strings.TrimPrefix(content, "```")
		content = strings.TrimSuffix(content, "```")
		// Also trim raw "```" if they exist inside the string not just prefix/suffix if the model wrapped it weirdly
		content = strings.ReplaceAll(content, "```latex", "")
		content = strings.ReplaceAll(content, "```", "")
	}

	return content, nil
}
