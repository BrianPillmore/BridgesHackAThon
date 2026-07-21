SHELL := /bin/bash

.PHONY: setup dev check test e2e build verify docker deploy doctor clean

setup:
	bash scripts/bootstrap.sh

dev:
	npm run dev

check:
	npm run check

test:
	npm run test

e2e:
	npm run test:e2e

build:
	npm run build

verify:
	npm run verify

docker:
	docker build --tag safeheat:local .

deploy:
	bash scripts/deploy-firebase.sh

doctor:
	npm run doctor

clean:
	rm -rf .next coverage playwright-report test-results
