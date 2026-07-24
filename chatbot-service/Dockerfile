# --- Stage 1: Build the Go binary ---
FROM golang:1.21-alpine AS builder
WORKDIR /app

# Copy the source code and configuration files
COPY . .

# Build a statically linked binary for Linux
RUN CGO_ENABLED=0 GOOS=linux go build -o chatbot-service .

# --- Stage 2: Create the final minimal image ---
FROM alpine:latest
WORKDIR /app

# Install security certificates just in case
RUN apk --no-cache add ca-certificates

# Copy the binary and data file from the builder stage
COPY --from=builder /app/chatbot-service .
COPY --from=builder /app/qna.json .

# Expose port 8081
EXPOSE 8081

# Run the chatbot service
CMD ["./chatbot-service"]
