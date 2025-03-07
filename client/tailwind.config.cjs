/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			"colors": {
				"dark-primary": "var(--dark-primary)",
				"primary": "var(--primary)",
				"light-primary": "var(--light-primary)",
				"background": "var(--background)",
				"progressbar": "var(--progress-bar)",
				"quickpeek": "var(--quickpeek)",
			},
			"opacity": {
				"progress-bar": "var(--progress-bar-opacity)",
			},
			"textColor": {
				"custom": "var(--text-color)",
				"true-white": "white",
			},
			"borderWidth": {
				"custom": "var(--border-width)",
			},
			"borderColor": {
				"custom-color": "var(--border-color)",
			},
			"backgroundImage": {
				"dark": "var(--background-image-dark)",
				"light": "var(--background-image-light)"
			},
			"fontSize": {
				"ultramd": "1.25rem",
			},
			"maxHeight": {
				"screen-1/2": "50vh",
				"screen-1/3": "33vh",
				"screen-2/3": "66vh",
				"screen-1/4": "25vh",
				"screen-3/4": "75vh",
			},
			"animation": {
				"pop-in": "pop-in 0.25s ease-in-out",
			},
			"keyframes": {
				"pop-in": {
					"0%": {
						"transform": "scale(0.75)",
						"opacity": "0",
					},
					"100%": {
						"transform": "scale(1)",
						"opacity": "1",
					}
				}
			},
			"zIndex": {
				"1": "1",
			},
			/* custom unit .5 */
			"spacing": {
				"0.5": "0.125rem",
				"1.5": "0.375rem",
				"2.5": "0.625rem",
			}
		},
	},
	plugins: [
		require("tailwindcss-safe-area")
	],
}
