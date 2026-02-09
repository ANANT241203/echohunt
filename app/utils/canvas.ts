export interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
}

export const createConfetti = (width: number, height: number): Point[] => {
  const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f', '#fff'];
  const particles: Point[] = [];
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: width / 2,
      y: height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: (Math.random() - 0.5) * 15,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 1.0
    });
  }
  return particles;
};

export const drawOverlay = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  mode: 'searching' | 'almost' | 'success',
  particles: Point[]
) => {
  ctx.clearRect(0, 0, width, height);

  const cx = width / 2;
  const cy = height / 2;
  const time = Date.now() / 1000;

  // Draw Reticle
  if (mode === 'searching' || mode === 'almost') {
    const baseColor = mode === 'almost' ? 'rgba(255, 200, 0, 0.8)' : 'rgba(56, 189, 248, 0.6)';
    const pulse = Math.sin(time * (mode === 'almost' ? 8 : 3)) * 10;
    const radius = 80 + pulse;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Crosshair
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy);
    ctx.lineTo(cx + 10, cy);
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx, cy + 10);
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Draw Particles
  if (mode === 'success') {
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.life -= 0.02;

      if (p.life > 0) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, 6, 6);
      } else {
        particles.splice(i, 1);
      }
    });
    ctx.globalAlpha = 1.0;
  }
};