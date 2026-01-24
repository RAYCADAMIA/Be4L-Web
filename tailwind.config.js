/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--primary)',
                surface: 'var(--bg-surface)',
                card: 'var(--bg-card)',
                'deep-black': 'var(--bg-primary)',
                'primary-text': 'var(--text-primary)',
                'secondary-text': 'var(--text-secondary)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Montserrat', 'sans-serif'],
            },
            animation: {
                'lore-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shine': 'shine 1.5s ease-in-out infinite',
                'progress': 'progress 2s ease-in-out infinite',
            },
            keyframes: {
                shine: {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                progress: {
                    '0%': { width: '0%', opacity: '0.3' },
                    '50%': { width: '70%', opacity: '1' },
                    '100%': { width: '100%', opacity: '0.3' },
                }
            }

        },
    },
    plugins: [],
}
