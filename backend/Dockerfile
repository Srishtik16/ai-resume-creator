# Build Stage
FROM golang:1.23-alpine AS builder

# Set working directory
WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
# -o main: Output binary name
# .: Build current directory
RUN go build -o main .

# Final Stage
FROM ubuntu:22.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
# - ca-certificates: For HTTPS requests (Gemini API)
# - texlive-latex-base: Minimal LaTeX system
# - texlive-latex-extra: Common packages (geometry, titling, etc.)
# - texlive-fonts-recommended: Standard fonts
# - texlive-latex-recommended: Recommended packages
RUN apt-get update && apt-get install -y \
    ca-certificates \
    texlive-latex-base \
    texlive-latex-extra \
    texlive-fonts-recommended \
    texlive-latex-recommended \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /root/

# Copy binary from builder
COPY --from=builder /app/main .

# Copy .env file if you want to bundle it (though env vars are better set in Railway UI)
# COPY .env . 

# Expose the port (Railway ignores this EXPOSE instruction but it's good documentation)
EXPOSE 8080

# Run the binary
CMD ["./main"]
