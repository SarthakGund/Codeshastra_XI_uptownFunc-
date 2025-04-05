// 'use client'
// import React, { useEffect, useRef } from 'react';

// type Mouse = {
//   x: number | null;
//   y: number | null;
//   radius: number;
// };

// type Position = {
//   x: number;
//   y: number;
// };

// const Hero: React.FC = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current!;
//     const ctx = canvas.getContext('2d')!;
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;

//     const particleSize = 1;
//     const particleSpacing = 1.4;
//     const mouseRadius = 70;

//     const mouse: Mouse = {
//       x: null,
//       y: null,
//       radius: mouseRadius,
//     };

//     let particlesArray: Particle[] = [];

//     window.addEventListener('mousemove', (event) => {
//       mouse.x = event.x;
//       mouse.y = event.y;
//     });

//     class Particle {
//       x: number;
//       y: number;
//       size: number;
//       color: string;
//       baseX: number;
//       baseY: number;
//       density: number;

//       constructor(x: number, y: number) {
//         this.x = Math.random() * canvas.width;
//         this.y = Math.random() * canvas.height;
//         this.size = particleSize;
//         this.color = '#EB0029';
//         this.baseX = x;
//         this.baseY = y;
//         this.density = Math.random() * 30 + 1;
//       }

//       draw() {
//         ctx.fillStyle = this.color;
//         ctx.beginPath();
//         ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
//         ctx.closePath();
//         ctx.fill();
//       }

//       update() {
//         if (mouse.x === null || mouse.y === null) return;

//         const dx = mouse.x - this.x;
//         const dy = mouse.y - this.y;
//         const distance = Math.sqrt(dx * dx + dy * dy);
//         const force = (mouse.radius - distance) / mouse.radius;
//         const directionX = (dx / distance) * force * this.density;
//         const directionY = (dy / distance) * force * this.density;

//         if (distance < mouse.radius) {
//           this.x -= directionX;
//           this.y -= directionY;
//         } else {
//           if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 10;
//           if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 10;
//         }
//       }
//     }

//     const loadSVG = async (url: string): Promise<string[]> => {
//       const response = await fetch(url);
//       const text = await response.text();
//       const parser = new DOMParser();
//       const xmlDoc = parser.parseFromString(text, 'image/svg+xml');
//       const paths = xmlDoc.getElementsByTagName('path');
//       return Array.from(paths).map((path) => path.getAttribute('d') || '');
//     };

//     const getParticlePositionsFromPathData = (
//       pathData: string
//     ): { positions: Position[]; minX: number; maxX: number; minY: number; maxY: number } => {
//       const positions: Position[] = []; 
//       const path = new Path2D(pathData);

//       let minX = canvas.width,
//         maxX = 0,
//         minY = canvas.height,
//         maxY = 0;

//       for (let y = 0; y < canvas.height; y += particleSpacing) {
//         for (let x = 0; x < canvas.width; x += particleSpacing) {
//           if (ctx.isPointInPath(path, x, y)) {
//             positions.push({ x, y });
//             minX = Math.min(minX, x);
//             maxX = Math.max(maxX, x);
//             minY = Math.min(minY, y);
//             maxY = Math.max(maxY, y);
//           }
//         }
//       }

//       return { positions, minX, maxX, minY, maxY };
//     };

//     const init = async () => {
//       particlesArray = [];

//     //   const svgPaths = await loadSVG(
//     //     'https://upload.wikimedia.org/wikipedia/fr/5/5b/Riot_Games_2022.svg'
//     //   );

//     const svgPaths = await loadSVG('/assets/logo3.svg');
//     console.log("SVG Paths loaded:", svgPaths.length);

//       let allPositions: Position[] = [];
//       let minX = canvas.width,
//         maxX = 0,
//         minY = canvas.height,
//         maxY = 0;

//       svgPaths.forEach((pathData) => {
//         const {
//           positions,
//           minX: pMinX,
//           maxX: pMaxX,
//           minY: pMinY,
//           maxY: pMaxY,
//         } = getParticlePositionsFromPathData(pathData);

//         allPositions = [...allPositions, ...positions];

//         minX = Math.min(minX, pMinX);
//         maxX = Math.max(maxX, pMaxX);
//         minY = Math.min(minY, pMinY);
//         maxY = Math.max(maxY, pMaxY);
//       });

//       const offsetX = (canvas.width - (maxX - minX)) / 2 - minX;
//       const offsetY = (canvas.height - (maxY - minY)) / 2 - minY;

//       allPositions = allPositions.map((pos) => ({
//         x: pos.x + offsetX,
//         y: pos.y + offsetY,
//       }));

//       allPositions.forEach((pos) => {
//         particlesArray.push(new Particle(pos.x, pos.y));
//       });
//     };

//     const animate = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height);
//       for (const p of particlesArray) {
//         p.draw();
//         p.update();
//       }
//       requestAnimationFrame(animate);
//     };

//     init();
//     animate();

//     const handleResize = () => {
//       canvas.width = window.innerWidth;
//       canvas.height = window.innerHeight;
//       init();
//     };

//     window.addEventListener('resize', handleResize);

//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);

//   return (
//     <canvas
//       ref={canvasRef}
//       style={{
//         width: '100vw',
//         height: '100vh',
//         display: 'block',
//         backgroundColor: '#000000',
//       }}
//     />
//   );
// };

// export default Hero;
