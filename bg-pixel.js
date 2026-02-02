const PixelBackground = (() => {
    let canvas, ctx;
    let width, height;
    let pixels = [];
    let animationId;
    
    // Default colors
    let bgFill = '#0f172a';
    let pixelBase = { r: 39, g: 64, b: 86 }; 

    function init() {
        canvas = document.getElementById('pixel-bg');
        if (!canvas) return;
        ctx = canvas.getContext('2d');
        
        window.addEventListener('resize', resize);
        resize();
        
        // Initial color update
        updateColors();
        
        animate();
    }

    function resize() {
        if (!canvas) return;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initPixels();
    }

    function initPixels() {
        pixels = [];
        const pixelSize = 50;
        const cols = Math.ceil(width / pixelSize) + 1;
        const rows = Math.ceil(height / pixelSize) + 1;

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                pixels.push({
                    x: x * pixelSize,
                    y: y * pixelSize,
                    size: pixelSize,
                    alpha: Math.random() * 0.5 + 0.1,
                    targetAlpha: Math.random() * 0.8 + 0.2,
                    speed: Math.random() * 0.005 + 0.002,
                    shade: Math.random() > 0.5 ? 1 : 0.9 
                });
            }
        }
    }

    function updateColors() {
        const style = getComputedStyle(document.body);
        bgFill = style.getPropertyValue('--bg').trim() || '#0f172a';
        
        // Try to get card-bg for pixel color, fallback to brand blue
        const cardBg = style.getPropertyValue('--card-bg').trim();
        
        // Parse the color (simple hex or rgba parser)
        const rgb = parseColor(cardBg);
        if (rgb) {
            pixelBase = rgb;
        }
    }

    function parseColor(str) {
        if (!str) return null;
        
        // Handle hex
        if (str.startsWith('#')) {
            let hex = str.slice(1);
            if (hex.length === 3) hex = hex.split('').map(c => c+c).join('');
            const bigint = parseInt(hex, 16);
            return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255
            };
        }
        
        // Handle rgba/rgb
        if (str.startsWith('rgb')) {
            const match = str.match(/(\d+),\s*(\d+),\s*(\d+)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
        }
        return null;
    }

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);
        
        // Draw background
        ctx.fillStyle = bgFill;
        ctx.fillRect(0, 0, width, height);

        pixels.forEach(p => {
            // Update alpha
            if (p.alpha < p.targetAlpha) {
                p.alpha += p.speed;
                if (p.alpha >= p.targetAlpha) {
                    p.targetAlpha = Math.random() * 0.6 + 0.1;
                }
            } else {
                p.alpha -= p.speed;
                if (p.alpha <= p.targetAlpha) {
                    p.targetAlpha = Math.random() * 0.8 + 0.2;
                }
            }

            // Draw pixel
            ctx.fillStyle = `rgba(${pixelBase.r * p.shade}, ${pixelBase.g * p.shade}, ${pixelBase.b * p.shade}, ${p.alpha})`;
            ctx.fillRect(p.x, p.y, p.size - 1, p.size - 1);
        });

        animationId = requestAnimationFrame(animate);
    }

    return {
        init,
        updateColors
    };
})();

document.addEventListener('DOMContentLoaded', PixelBackground.init);

// Expose for external updates
window.updatePixelTheme = PixelBackground.updateColors;
