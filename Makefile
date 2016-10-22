MOCHA = "./node_modules/.bin/mocha"

MOCHA_FLAGS = --ui tdd --reporter spec -s 500 -t 10000
ifdef OPTS
	MOCHA_FLAGS += $(OPTS)
endif

test:
	@./node_modules/.bin/envrun -e test.env --path -- $(MOCHA) $(MOCHA_FLAGS) $(FILE)

.PHONY: test
