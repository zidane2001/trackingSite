export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C8A951',
          50: '#FBF7EC',
          100: '#F5ECCE',
          200: '#EDDA9F',
          300: '#E0C56A',
          400: '#D4B44E',
          500: '#C8A951',
          600: '#A68A3A',
          700: '#7D672C',
          800: '#55451E',
          900: '#2C2310',
        },
      },
      animation: {
        'header': 'header-slide-down 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'logo-pop': 'logo-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.2s both',
        'nav-in': 'nav-slide-in 0.5s cubic-bezier(0.16,1,0.3,1) 0.3s both',
        'cta-in': 'cta-slide-left 0.5s cubic-bezier(0.16,1,0.3,1) 0.4s both',
        'hero-badge': 'hero-badge-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        'hero-title': 'hero-title-in 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both',
        'hero-desc': 'hero-desc-in 0.6s cubic-bezier(0.16,1,0.3,1) 0.4s both',
        'hero-image': 'hero-image-in 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        'header-slide-down': {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
        'logo-pop': {
          '0%':   { transform: 'scale(0.3) rotate(-15deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.1) rotate(3deg)',  opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)',    opacity: '1' },
        },
        'nav-slide-in': {
          from: { transform: 'translateY(-12px)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
        'cta-slide-left': {
          from: { transform: 'translateX(40px)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        'hero-badge-in': {
          from: { transform: 'translateX(-20px)', opacity: '0' },
          to:   { transform: 'translateX(0)',     opacity: '1' },
        },
        'hero-title-in': {
          from: { transform: 'translateY(24px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'hero-desc-in': {
          from: { transform: 'translateY(16px)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        'hero-image-in': {
          from: { transform: 'scale(1.08) translateX(20px)', opacity: '0' },
          to:   { transform: 'scale(1) translateX(0)',       opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(200, 169, 81, 0.4)' },
          '50%':      { boxShadow: '0 0 20px 4px rgba(200, 169, 81, 0.15)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
}
