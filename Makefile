MOCHA := "mocha"
NYC := "nyc"

TESTS = test/*.js
TESTS_WITH_TIZEN = test/*.js libs/brackets-server/embedded-ext/project/test/*.js


test:
	@if ! type "tizen" > /dev/null; then make test-default; else make test-extension; fi


test-default:
	@echo "Run default test"
	@$(NYC) --reporter=text --reporter=html $(MOCHA) --timeout=10000 $(TESTS)

test-extension:
	@echo "Run test with tizen extension features"
	@$(NYC) --reporter=text --reporter=html $(MOCHA) --timeout=10000 $(TESTS) $(TESTS_WITH_TIZEN)

.PHONY: test test-default test-extension
