/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: 'var(--electric-teal)',
                surface: 'var(--bg-surface)',
                card: 'var(--bg-card)',
                'deep-void': 'var(--bg-deep)',
                'electric-teal': 'var(--electric-teal)',
                'primary-text': 'var(--text-primary)',
                'secondary-text': 'var(--text-secondary)',
                'cool-grey': 'var(--text-secondary)',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            animation: {
                'lore-slow': 'pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shine': 'shine 1.5s ease-in-out infinite',
                'progress': 'progress 2s ease-in-out infinite',
                'float-slow': 'float 6s ease-in-out infinite',
                'float-medium': 'float 5s ease-in-out infinite',
                'float-fast': 'float 4s ease-in-out infinite',
                'aurora-flow': 'aurora 20s linear infinite',
                'border-shift': 'border-shift 5s ease-in-out infinite',
            },
            keyframes: {
                aurora: {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
                'border-shift': {
                    '0%, 100%': { borderColor: '#2DD4BF' }, // Electric Teal
                    '50%': { borderColor: '#06B6D4' }, // Cyan
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
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
    plugins: [
        require('tailwindcss-animate'),
    ],
}
