// Micro-interactions for hover effects
document.querySelectorAll('article').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Simple ticker stop/start on hover
const ticker = document.querySelector('.animate-ticker');
ticker.addEventListener('mouseenter', () => {
    ticker.style.animationPlayState = 'paused';
});
ticker.addEventListener('mouseleave', () => {
    ticker.style.animationPlayState = 'running';
});
