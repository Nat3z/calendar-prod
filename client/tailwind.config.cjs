/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			"colors": {
				"dark-primary": "#050014",
				"primary": "#0e003a",
				"light-primary": "#1a0066",
			},
			/* custom unit .5 */
			"spacing": {
				"0.5": "0.125rem",
				"1.5": "0.375rem",
				"2.5": "0.625rem",
			}
		},
	},
	plugins: [],
}
