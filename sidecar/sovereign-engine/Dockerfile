FROM golang:1.24-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

ARG GOOS=linux
ARG GOARCH=arm64
COPY . .
RUN CGO_ENABLED=0 GOOS=${GOOS} GOARCH=${GOARCH} go build -o sovereign-engine-${GOOS}-${GOARCH} main.go

FROM alpine:latest
WORKDIR /root/
ARG GOOS=linux
ARG GOARCH=arm64
COPY --from=builder /app/sovereign-engine-${GOOS}-${GOARCH} ./sovereign-engine
COPY --from=builder /app/proto ./proto

EXPOSE 50051
CMD ["./sovereign-engine"]
