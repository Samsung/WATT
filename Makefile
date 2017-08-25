MOCHA := "mocha"
NYC := "nyc"

define test_node
	$(NYC) --reporter=text --reporter=html $(MOCHA) --timeout=$(1)
endef

TESTS = test/*.js
TESTS_TIZEN = libs/brackets-server/embedded-ext/project/test/*.js

test:
	@if ! type "tizen" > /dev/null; then make test-default; else make test-extension; fi

test-default:
	@echo "Run default test"
	$(call test_node,10000) $(TESTS)

test-extension:
	@echo "Run test with tizen extension features"
	$(call test_node,10000) $(TESTS) $(TESTS_TIZEN)

.PHONY: test test-default test-extension
