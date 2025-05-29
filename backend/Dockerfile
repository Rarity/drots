FROM golang:1.23-alpine

WORKDIR /app
COPY . .
RUN apk add --no-cache git && go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o darts ./main.go

EXPOSE 8080
CMD ["./darts"]