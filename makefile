init: docker-down docker-pull docker-build docker-up
up: docker-up
down: docker-down
restart: down up
clear: docker-clear


docker-up:
	docker-compose up -d

docker-pull:
	docker-compose pull

docker-build:
	docker-compose build

docker-down:
	docker-compose down --remove-orphans

docker-clear:
	docker-compose down --v --remove-orphans