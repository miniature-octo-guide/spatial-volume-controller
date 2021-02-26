ROOT_DIR = $(dir $(realpath $(firstword $(MAKEFILE_LIST))))

docker-build:
	docker build . -t spatial-volume-controller

docker-run: docker-build
	docker run --rm -it spatial-volume-controller \
		bash

build: docker-build
	docker run --rm \
		-v "$(ROOT_DIR)/dist:/code/dist" \
		spatial-volume-controller \
		npm run build:chrome

dev: docker-build
	docker run --rm \
		-v "$(ROOT_DIR)/app:/code/app" \
		-v "$(ROOT_DIR)/dist:/code/dist" \
		spatial-volume-controller \
		npm run dev:chrome

lint: docker-build
	docker run --rm \
		spatial-volume-controller \
		npm run lint

lint-fix: docker-build
	docker run --rm \
		spatial-volume-controller \
		npm run lint-fix
