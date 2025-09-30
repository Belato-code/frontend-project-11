install:
	npm ci
lint:
	npx eslint
develop:
	npm run dev
build:
	NODE_ENV=production npm run build