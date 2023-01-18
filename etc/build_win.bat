@echo off

cd ..

rmdir /s /q "dist"

tsc "-p" "./tsconfig.build.json" "--pretty"

XCOPY /s "src/public" "dist/src/public"

XCOPY  "package.json" "dist/package.json"