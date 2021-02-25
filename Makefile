docker-build:
	docker build . -t spatial-volume-controller

docker-run: docker-build
	docker run --rm -it spatial-volume-controller \
		bash

build: docker-build
	docker run --rm -it \
		-v "${PWD}/dist:/code/dist" \
		spatial-volume-controller \
		npm run build:chrome
