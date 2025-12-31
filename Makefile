.PHONY: help build up down restart logs clean backup restore

help: ## Mostrar ayuda
	@echo "Health Tracker - Comandos disponibles:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Construir imágenes de Docker
	docker-compose build --no-cache

up: ## Iniciar todos los servicios
	docker-compose up -d

down: ## Detener todos los servicios
	docker-compose down

restart: ## Reiniciar todos los servicios
	docker-compose restart

logs: ## Ver logs en tiempo real
	docker-compose logs -f

logs-app: ## Ver logs solo de la app
	docker-compose logs -f app

logs-db: ## Ver logs solo de la base de datos
	docker-compose logs -f postgres

status: ## Ver estado de contenedores
	docker-compose ps

deploy: ## Build completo y deploy
	@echo "🚀 Desplegando Health Tracker..."
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "✅ Deployment completado!"
	@make status

shell-app: ## Entrar al contenedor de la app
	docker exec -it health-tracker-app sh

shell-db: ## Entrar al contenedor de PostgreSQL
	docker exec -it health-tracker-db psql -U healthtracker -d health_tracker

clean: ## Limpiar contenedores e imágenes antiguas
	docker-compose down
	docker system prune -f

backup: ## Crear backup de base de datos y archivos
	./backup.sh

stats: ## Ver uso de recursos
	docker stats

env-generate: ## Generar claves para .env
	@echo "Genera estas claves para tu archivo .env:"
	@echo ""
	@echo "NEXTAUTH_SECRET=$(shell openssl rand -base64 32)"
	@echo "MASTER_ENCRYPTION_KEY=$(shell openssl rand -base64 32)"
	@echo "DB_PASSWORD=$(shell openssl rand -base64 32)"
