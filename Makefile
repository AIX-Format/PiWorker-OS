PROTO_DIR=sidecar/sovereign-engine/proto

gen:
	protoc --go_out=. --go-grpc_out=. $(PROTO_DIR)/*.proto

prebuild: gen tidy verify

tidy:
	go mod tidy

verify:
	go mod verify
	go vet ./...

build: prebuild
	go build -ldflags "-s -w" ./...

ci: build test

test:
	go test ./...
