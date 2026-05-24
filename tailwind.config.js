module.exports = {
    content: ['./views/**/*.ejs'],

    safelist: [
        {
            pattern: /^(bg|text)-(pink|blue|green|red|yellow|purple|indigo|orange|teal|cyan)-(50|100|600)$/,
        },
        // Glassmorphism classes
        'backdrop-blur-md',
        'backdrop-blur-lg',
        'backdrop-blur-xl',
        'bg-white/10',
        'bg-white/15',
        'bg-white/20',
        'bg-white/25',
        'bg-white/30',
        'bg-white/40',
        'border-white/10',
        'border-white/20',
        'border-white/30',
        'shadow-lg',
        'shadow-xl',
        'hover:shadow-xl',
        'hover:shadow-2xl',
        'hover:bg-white/40',
        'hover:bg-white/50',
        'group-hover:scale-110',
        'glass',
        'glass-sm',
        'glass-md',
        'glass-lg',
        'glass-xl',
    ],

    theme: {
        extend: {
            backdropBlur: {
                xs: '2px',
                sm: '6px',
                md: '12px',
                lg: '16px',
                xl: '20px',
                '2xl': '24px',
            },
            backgroundColor: {
                'glass': 'rgba(255, 255, 255, 0.15)',
                'glass-dark': 'rgba(0, 0, 0, 0.15)',
            },
            borderColor: {
                'glass': 'rgba(255, 255, 255, 0.2)',
                'glass-dark': 'rgba(0, 0, 0, 0.1)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
                'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
                'inset-glass': 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.1)',
            }
        }
    },
    plugins: [],
};
