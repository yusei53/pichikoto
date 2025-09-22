import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";
import amber from "@park-ui/panda-preset/colors/amber";
import sand from "@park-ui/panda-preset/colors/sand";

export default defineConfig({
	// Whether to use css reset
	preflight: true,

	presets: [createPreset({ accentColor: amber, grayColor: sand, radius: "sm" })],

	// Where to look for your css declarations
	include: [
		"./src/**/*.{js,jsx,ts,tsx}",
		"./pages/**/*.{js,jsx,ts,tsx}",
		"./src/app/**/*.{ts,tsx,js,jsx}",
	],

	// Files to exclude
	exclude: [],

	// Useful for theme customization
	theme: {
		extend: {
			tokens: {
				colors: {
					border: {
						value: "#9A9A9A",
					},
					sage: {
						value: "#A8CE8F",
					},
					blush: {
						value: "#FFB6B6",
					},
				},
			},
		},
	},
	jsxFramework: "react",

	// The output directory for your css system
	outdir: "styled-system",
});
