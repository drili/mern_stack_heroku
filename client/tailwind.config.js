module.exports = {
	purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: "class", // or 'media' or 'class'
	theme: {
		extend: {
            backgroundColor: {
                'custom-rgba': 'rgba(255, 255, 255, 0.05)',
            }
        },
	},
	variants: {
		extend: {},
	},
	plugins: [
        require('flowbite/plugin')
    ]
}
