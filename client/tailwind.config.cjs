/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			"colors": {
				"dark-primary": "#050014",
				"primary": "#0e003a",
				"light-primary": "#1a0066",
			}
		},
	},
	plugins: [],
}
