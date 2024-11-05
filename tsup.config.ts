import { defineConfig } from "tsup";

export default defineConfig([
	{
		entry: ["bin"],
		sourcemap: true,
		splitting: false,
		clean: true,
		dts: false,
		minify: false,
		format: ["cjs", "esm"],
		outDir: "./dist",
		banner: {
			js: "#!/usr/bin/env node",
		},
		external: ["commander"],
	},
	{
		entry: ["src"],
		sourcemap: true,
		splitting: false,
		clean: true,
		dts: true,
		minify: true,
		format: ["cjs", "esm"],
		outDir: "./dist",
	},
]);
