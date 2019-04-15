SCRIPT_DIR := $(PWD)
BUILD_DIR := $(PWD)/build

PATCH_FILE := $(SCRIPT_DIR)/mux.js-h264.patch

all: mux-js

clean:
	cd mux-js && rm -rf dist dist-test
	rm mux.js

npm_init:
	cd mux-js && npm install

mux-js_patch:
	cd mux-js && git apply --reverse --check $(PATCH_FILE) || git apply $(PATCH_FILE)

mux-js_build: npm_init mux-js_patch
	cd mux-js && npm run build

mux-js: mux-js_build
	cp mux-js/dist/mux.js .

