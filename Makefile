.PHONY: help setup init-env dev dev-api dev-web docker-up docker-up-llm docker-down docker-reset db-migrate db-seed db-seed-catalog db-regenerate-embeddings db-studio db-reset logs clean env-check generate-secret test test-api test-web test-cov lint format deploy deploy-quick deploy-migrate prod-logs prod-status

# Production server config
PROD_HOST := albore-prod
PROD_PATH := ~/albore_app
PROD_BUN := export BUN_INSTALL=\$$HOME/.bun && export PATH=\$$BUN_INSTALL/bin:\$$PATH

help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

init-env: ## Initialize .env file with generated secrets
	@if [ ! -f .env ]; then \
		echo "Creating .env from .env.example..."; \
		cp .env.example .env; \
		PROJECT_NAME=$$(basename "$$(pwd)"); \
		JWT_SECRET=$$(openssl rand -base64 32); \
		JWT_REFRESH_SECRET=$$(openssl rand -base64 32); \
		if [ "$$(uname)" = "Darwin" ]; then \
			sed -i '' "s|COMPOSE_PROJECT_NAME=\"myproject\"|COMPOSE_PROJECT_NAME=\"$$PROJECT_NAME\"|g" .env; \
			sed -i '' "s|your-jwt-secret-here-use-make-generate-secret|$$JWT_SECRET|g" .env; \
			sed -i '' "s|your-refresh-secret-here-use-make-generate-secret|$$JWT_REFRESH_SECRET|g" .env; \
		else \
			sed -i "s|COMPOSE_PROJECT_NAME=\"myproject\"|COMPOSE_PROJECT_NAME=\"$$PROJECT_NAME\"|g" .env; \
			sed -i "s|your-jwt-secret-here-use-make-generate-secret|$$JWT_SECRET|g" .env; \
			sed -i "s|your-refresh-secret-here-use-make-generate-secret|$$JWT_REFRESH_SECRET|g" .env; \
		fi; \
		echo ".env created with COMPOSE_PROJECT_NAME=$$PROJECT_NAME and generated JWT secrets"; \
	else \
		echo ".env already exists, skipping"; \
	fi

setup: init-env ## Complete project setup (install + docker + migrate + seed)
	@echo "Setting up the project..."
	bun install
	@$(MAKE) docker-up
	@sleep 5
	@$(MAKE) db-migrate
	@$(MAKE) db-seed
	@echo "Setup complete! Run 'make dev' to start developing"

dev: ## Start frontend + backend in development mode
	@echo "Starting development servers..."
	@bun run dev

dev-api: ## Start backend only
	@echo "Starting API server..."
	@cd apps/api && bun run dev

dev-web: ## Start frontend only
	@echo "Starting web server..."
	@cd apps/web && bun run dev

docker-up: ## Start base services (postgres + redis)
	@echo "Starting base Docker services..."
	docker-compose up -d
	@echo "Base services started"

docker-up-llm: ## Start with LiteLLM (base + litellm)
	@echo "Starting with LiteLLM..."
	docker-compose -f docker-compose.yml -f docker-compose.ai.yml up -d
	@echo "Services started with LiteLLM"

docker-down: ## Stop all Docker services
	@echo "Stopping Docker services..."
	docker-compose down
	@echo "Services stopped"

docker-reset: ## Stop services and remove volumes
	@echo "Resetting Docker (removing volumes)..."
	docker-compose down -v
	@echo "Docker reset complete"

db-migrate: ## Run Prisma migrations
	@echo "Running database migrations..."
	bunx prisma migrate dev
	@echo "Migrations complete"

db-seed: ## Seed the database
	@echo "Seeding database..."
	bunx tsx prisma/seed.ts
	@echo "Seeding complete"

db-seed-catalog: ## Seed catalog with services (for invoice analysis testing)
	@echo "Seeding catalog..."
	bunx tsx prisma/seed-catalog.ts
	@echo "Catalog seeding complete"

db-regenerate-embeddings: ## Regenerate service embeddings using OpenAI (requires LiteLLM)
	@echo "Regenerating embeddings..."
	bunx tsx prisma/regenerate-embeddings.ts
	@echo "Embeddings regenerated"

db-studio: ## Open Prisma Studio
	@echo "Opening Prisma Studio..."
	bunx prisma studio

db-reset: ## Reset database (migrate + seed)
	@echo "Resetting database..."
	bunx prisma migrate reset --force
	@echo "Database reset complete"

logs: ## Show Docker logs
	docker-compose logs -f

clean: ## Clean node_modules and dist folders
	@echo "Cleaning project..."
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	rm -rf apps/*/dist packages/*/dist
	@echo "Clean complete"

env-check: ## Check if .env file exists
	@if [ ! -f .env ]; then \
		echo ".env file not found!"; \
		echo "Run: cp .env.example .env"; \
		exit 1; \
	else \
		echo ".env file exists"; \
	fi

generate-secret: ## Generate random secrets for JWT
	@echo "JWT_SECRET=\"$$(openssl rand -base64 32)\""
	@echo "JWT_REFRESH_SECRET=\"$$(openssl rand -base64 32)\""

test: ## Run all tests
	@echo "Running all tests..."
	@cd apps/api && bun run test
	@cd apps/web && bun run test
	@echo "All tests complete"

test-api: ## Run API tests
	@echo "Running API tests..."
	@cd apps/api && bun run test

test-web: ## Run Web tests
	@echo "Running Web tests..."
	@cd apps/web && bun run test

test-cov: ## Run tests with coverage
	@echo "Running tests with coverage..."
	@cd apps/api && bun run test:cov
	@cd apps/web && bun run test:cov

lint: ## Run ESLint check
	@echo "Running ESLint..."
	@bun run lint:check

format: ## Format code (Prettier + ESLint fix)
	@echo "Formatting code..."
	@bun run format && bun run lint:fix

# === DEPLOYMENT ===

deploy: ## Deploy to production (build + sync + install + restart)
	@echo "🚀 Deploying to production..."
	@echo "📦 Building API..."
	@cd apps/api && bun run build
	@echo "📤 Syncing files to $(PROD_HOST)..."
	@rsync -avz --delete \
		--exclude 'node_modules' \
		--exclude '.env' \
		--exclude '.git' \
		--exclude 'uploads' \
		--exclude 'data' \
		--exclude 'dist' \
		--exclude '.DS_Store' \
		./ $(PROD_HOST):$(PROD_PATH)/
	@echo "📤 Syncing compiled dist..."
	@rsync -avz --delete apps/api/dist/ $(PROD_HOST):$(PROD_PATH)/apps/api/dist/
	@echo "📥 Installing dependencies on server..."
	@ssh $(PROD_HOST) "$(PROD_BUN) && cd $(PROD_PATH) && bun install"
	@echo "🔄 Restarting PM2..."
	@ssh $(PROD_HOST) "pm2 restart albore-api"
	@echo "✅ Deployment complete!"
	@ssh $(PROD_HOST) "pm2 status"

deploy-quick: ## Quick deploy (no bun install - use when deps unchanged)
	@echo "🚀 Quick deploy to production..."
	@echo "📦 Building API..."
	@cd apps/api && bun run build
	@echo "📤 Syncing files to $(PROD_HOST)..."
	@rsync -avz --delete \
		--exclude 'node_modules' \
		--exclude '.env' \
		--exclude '.git' \
		--exclude 'uploads' \
		--exclude 'data' \
		--exclude 'dist' \
		--exclude '.DS_Store' \
		./ $(PROD_HOST):$(PROD_PATH)/
	@echo "📤 Syncing compiled dist..."
	@rsync -avz --delete apps/api/dist/ $(PROD_HOST):$(PROD_PATH)/apps/api/dist/
	@echo "🔄 Restarting PM2..."
	@ssh $(PROD_HOST) "pm2 restart albore-api"
	@echo "✅ Deployment complete!"
	@ssh $(PROD_HOST) "pm2 status"

deploy-migrate: ## Deploy with Prisma migration
	@$(MAKE) deploy
	@echo "🗄️ Running Prisma migrations..."
	@ssh $(PROD_HOST) "$(PROD_BUN) && cd $(PROD_PATH) && bunx prisma migrate deploy"
	@echo "🔄 Restarting PM2 after migration..."
	@ssh $(PROD_HOST) "pm2 restart albore-api"
	@echo "✅ Migration complete!"

prod-logs: ## Show production logs (tail -f)
	@ssh $(PROD_HOST) "pm2 logs albore-api --lines 50"

prod-status: ## Show production status
	@ssh $(PROD_HOST) "pm2 status && echo '' && pm2 logs albore-api --lines 10 --nostream"
