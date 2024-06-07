module.exports = {
	purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
	darkMode: "class", // or 'media' or 'class'
	theme: {
		extend: {
            backgroundColor: {
                'custom-rgba': 'rgba(255, 255, 255, 0.05)',
            },
            lineHeight: {
                "custom-12": "1.2em",
                "custom-14": "1.4em", 
            },
            borderRadius: {
                "extra-large": "20px",
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
