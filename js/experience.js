/**
 * ====================================================================
 * BIBI LACOSTE ART — MOTOR 3D WEBGL & FASES NARRATIVAS (THREE.JS)
 * Brújula interactiva, Cosmos de la Materia y Ensamblaje Matérico
 * ====================================================================
 */

    /* ========================================================
       APPLICATION STATE & RESPONSIVENESS
       ======================================================== */
    let appState = 'FASE1'; // 'FASE1' | 'TRANSITION' | 'COSMOS'
    let currentStep = 0;
    let isUnlocked = false;

    function getScreenAspect() {
      return window.innerWidth / window.innerHeight;
    }

    function isMobileDevice() {
      return window.innerWidth < 768 || window.innerHeight > window.innerWidth;
    }

    /* ========================================================
       1. GENERATE PROCEDURAL BURLAP (ARPILLERA) + PAPER TEXTURE
       ======================================================== */
    const textCanvas = document.createElement('canvas');
    textCanvas.width = 1024;
    textCanvas.height = 1024;
    const textCtx = textCanvas.getContext('2d');
    let burlapTexture;

    function createBurlapPath(ctx, w, h, margin) {
      ctx.beginPath();
      const steps = 60;
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const px = margin + t * (w - 2 * margin);
        const noise = Math.sin(t * 30) * 4 + Math.cos(t * 60) * 3 + (Math.sin(t * 90) * 2);
        const py = margin + noise;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const py = margin + t * (h - 2 * margin);
        const noise = Math.sin(t * 32) * 4 + Math.cos(t * 64) * 3 + (Math.cos(t * 95) * 2);
        const px = (w - margin) + noise;
        ctx.lineTo(px, py);
      }
      for (let i = 0; i <= steps; i++) {
        const t = 1 - (i / steps);
        const px = margin + t * (w - 2 * margin);
        const noise = Math.sin(t * 28) * 4 + Math.cos(t * 55) * 3 + (Math.sin(t * 85) * 2);
        const py = (h - margin) + noise;
        ctx.lineTo(px, py);
      }
      for (let i = 0; i <= steps; i++) {
        const t = 1 - (i / steps);
        const py = margin + t * (h - 2 * margin);
        const noise = Math.sin(t * 34) * 4 + Math.cos(t * 68) * 3 + (Math.cos(t * 92) * 2);
        const px = margin + noise;
        ctx.lineTo(px, py);
      }
      ctx.closePath();
    }

    function drawBurlapLayer(step) {
      const w = textCanvas.width;
      const h = textCanvas.height;
      const ctx = textCtx;

      ctx.clearRect(0, 0, w, h);

      // 1. Soft Ambient Drop Shadow
      ctx.save();
      createBurlapPath(ctx, w, h, 70);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 24;
      ctx.fillStyle = 'rgba(12, 10, 6, 0.9)';
      ctx.fill();
      ctx.restore();

      // 2. Draw Burlap & Paper Body
      ctx.save();
      createBurlapPath(ctx, w, h, 70);
      ctx.clip();

      const baseGrad = ctx.createRadialGradient(w * 0.4, h * 0.4, 50, w/2, h/2, w * 0.65);
      baseGrad.addColorStop(0.0, '#B89B74');
      baseGrad.addColorStop(0.6, '#A1835C');
      baseGrad.addColorStop(1.0, '#785D3B');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, w, h);

      // Coarse Burlap Weave
      const threadSpacing = 16;
      ctx.lineWidth = 3.5;

      for (let y = 60; y < h - 60; y += threadSpacing) {
        ctx.strokeStyle = (Math.floor(y / threadSpacing) % 2 === 0) ? 'rgba(74, 54, 32, 0.45)' : 'rgba(215, 185, 145, 0.35)';
        ctx.beginPath();
        ctx.moveTo(60, y + (Math.sin(y) * 2));
        ctx.lineTo(w - 60, y + (Math.cos(y) * 2));
        ctx.stroke();
      }

      for (let x = 60; x < w - 60; x += threadSpacing) {
        ctx.strokeStyle = (Math.floor(x / threadSpacing) % 2 === 0) ? 'rgba(64, 46, 26, 0.5)' : 'rgba(230, 200, 160, 0.4)';
        ctx.beginPath();
        ctx.moveTo(x + (Math.cos(x) * 2), 60);
        ctx.lineTo(x + (Math.sin(x) * 2), h - 60);
        ctx.stroke();
      }

      // Hand-Pressed Paper Pulp Wash
      const paperWash = ctx.createLinearGradient(60, 60, w - 60, h - 60);
      paperWash.addColorStop(0.0, 'rgba(240, 228, 210, 0.48)');
      paperWash.addColorStop(0.4, 'rgba(215, 195, 168, 0.28)');
      paperWash.addColorStop(1.0, 'rgba(180, 150, 115, 0.38)');
      ctx.fillStyle = paperWash;
      ctx.fillRect(0, 0, w, h);

      // Frayed Threads
      ctx.strokeStyle = 'rgba(220, 190, 150, 0.65)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 180; i++) {
        const side = Math.floor(Math.random() * 4);
        let fx, fy, dx, dy;
        if (side === 0) { fx = 70 + Math.random() * (w - 140); fy = 70; dx = (Math.random()-0.5)*15; dy = -12 - Math.random()*25; }
        else if (side === 1) { fx = w - 70; fy = 70 + Math.random() * (h - 140); dx = 12 + Math.random()*25; dy = (Math.random()-0.5)*15; }
        else if (side === 2) { fx = 70 + Math.random() * (w - 140); fy = h - 70; dx = (Math.random()-0.5)*15; dy = 12 + Math.random()*25; }
        else { fx = 70; fy = 70 + Math.random() * (h - 140); dx = -12 - Math.random()*25; dy = (Math.random()-0.5)*15; }

        ctx.beginPath();
        ctx.moveTo(fx, fy);
        ctx.lineTo(fx + dx, fy + dy);
        ctx.stroke();
      }

      // Archival Stamp
      ctx.save();
      ctx.translate(w/2, h/2);

      ctx.strokeStyle = 'rgba(55, 38, 22, 0.55)';
      ctx.lineWidth = 3.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, 160, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '700 28px "Cinzel", serif';
      ctx.fillStyle = 'rgba(55, 38, 22, 0.75)';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '6px';
      ctx.fillText('BIBIANA LACOSTE', 0, -35);

      ctx.font = 'italic 400 24px "Cormorant Garamond", serif';
      ctx.fillStyle = 'rgba(90, 55, 30, 0.85)';
      ctx.fillText('• Tejido del Recuerdo •', 0, 10);

      ctx.font = '600 20px "Cinzel", serif';
      ctx.fillStyle = 'rgba(55, 38, 22, 0.7)';
      ctx.fillText('1967 • TALLER TIGRE', 0, 50);

      // Progressive Layer Markings on Burlap
      if (step >= 1) {
        ctx.fillStyle = 'rgba(165, 80, 45, 0.35)';
        ctx.beginPath();
        ctx.arc(0, -90, 80, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'italic 500 22px "Cormorant Garamond", serif';
        ctx.fillStyle = '#3A1E10';
        ctx.fillText('Taipas de arroz', 0, -85);
      }

      if (step >= 2) {
        ctx.strokeStyle = 'rgba(140, 60, 35, 0.65)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(-120, 80, 240, 45);
        ctx.font = '600 16px "Cinzel", serif';
        ctx.fillStyle = 'rgba(140, 60, 35, 0.85)';
        ctx.fillText('Distancias de ultramar', 0, 108);
      }

      if (step >= 3) {
        ctx.fillStyle = 'rgba(245, 235, 218, 0.75)';
        ctx.fillRect(-140, -15, 280, 40);
        ctx.font = 'italic 500 20px "Cormorant Garamond", serif';
        ctx.fillStyle = '#26160A';
        ctx.fillText('Cítricos que transforman paisajes', 0, 12);
      }

      if (step >= 4) {
        ctx.strokeStyle = '#D4A054';
        ctx.lineWidth = 4;
        ctx.shadowColor = 'rgba(212, 160, 84, 0.8)';
        ctx.shadowBlur = 14;
        ctx.strokeRect(-190, -190, 380, 380);
      }

      ctx.restore();
      ctx.restore();

      if (burlapTexture) burlapTexture.needsUpdate = true;
    }

    function initBurlapTexture() {
      drawBurlapLayer(0);
      burlapTexture = new THREE.CanvasTexture(textCanvas);
      burlapTexture.anisotropy = 16;
      return burlapTexture;
    }

    /* ========================================================
       2. THREE.JS SCENE SETUP & LIGHTING
       ======================================================== */
    const canvas = document.getElementById('webgl-canvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
    
    // Set initial camera distance adapted to portrait vs landscape
    function getResponsiveCameraZ() {
      const aspect = getScreenAspect();
      if (aspect < 1.0) {
        // Portrait phone: move camera back so horizontal field contains the patch comfortably
        return 6.8 / Math.max(0.55, aspect * 1.35);
      }
      return 6.8;
    }

    camera.position.set(0, 0, getResponsiveCameraZ());

    const keyLight = new THREE.DirectionalLight(0xFFE4C2, 1.55);
    keyLight.position.set(3.2, 4.0, 3.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xC49A6C, 1.1);
    rimLight.position.set(-3.5, 2.0, -1.0);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0x453526, 1.3);
    scene.add(ambientLight);

    // BASE RESTING POSE FOR FASE 1 RELIC
    const basePose = {
      rotX: -0.48,
      rotY: 0.44,
      rotZ: -0.10
    };

    // Burlap Relic Group
    const burlapGroup = new THREE.Group();
    burlapGroup.position.set(0, 0.18, 0);
    burlapGroup.rotation.set(basePose.rotX, basePose.rotY, basePose.rotZ);
    scene.add(burlapGroup);

    const patchW = 1.15;
    const patchH = 1.35;
    const patchGeo = new THREE.PlaneGeometry(patchW, patchH, 24, 28);

    const posAttr = patchGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const u = (posAttr.getX(i) / patchW);
      const v = (posAttr.getY(i) / patchH);
      const curl = (Math.pow(u, 2) * 0.08) - (Math.pow(v, 2) * 0.05);
      const wave = Math.sin(u * Math.PI * 2) * 0.025 * Math.cos(v * Math.PI * 2);
      posAttr.setZ(i, curl + wave);
    }
    patchGeo.computeVertexNormals();

    const burlapMat = new THREE.MeshStandardMaterial({
      map: initBurlapTexture(),
      transparent: true,
      roughness: 0.92,
      metalness: 0.02,
      side: THREE.DoubleSide
    });

    const burlapMesh = new THREE.Mesh(patchGeo, burlapMat);
    burlapGroup.add(burlapMesh);

    /* ========================================================
       3. VOLUMETRIC POLVO DE LADRILLO & GOLD DUST PARTICLES
       ======================================================== */
    const particleCount = 1600;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const particleVelocities = new Float32Array(particleCount * 3);
    const particleSeeds = new Float32Array(particleCount);

    const brickPalette = [
      new THREE.Color(0xBA4E32),
      new THREE.Color(0xD06440),
      new THREE.Color(0x8E3218),
      new THREE.Color(0xC55735),
      new THREE.Color(0x9E3F24)
    ];

    const goldFlaxPalette = [
      new THREE.Color(0xE2C8A4),
      new THREE.Color(0xCFB38A),
      new THREE.Color(0xF3E5D0)
    ];

    const earthCharcoalPalette = [
      new THREE.Color(0x4E2E1D),
      new THREE.Color(0x382115)
    ];

    const micaColor = new THREE.Color(0xFFF4D6);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePos[i3] = (Math.random() - 0.5) * 36;
      particlePos[i3 + 1] = (Math.random() - 0.5) * 28;
      particlePos[i3 + 2] = (Math.random() - 0.5) * 32 - 2;

      const r = Math.random();
      let col;
      if (r < 0.45) {
        col = brickPalette[Math.floor(Math.random() * brickPalette.length)];
      } else if (r < 0.80) {
        col = goldFlaxPalette[Math.floor(Math.random() * goldFlaxPalette.length)];
      } else if (r < 0.95) {
        col = earthCharcoalPalette[Math.floor(Math.random() * earthCharcoalPalette.length)];
      } else {
        col = micaColor;
      }

      particleColors[i3] = col.r;
      particleColors[i3 + 1] = col.g;
      particleColors[i3 + 2] = col.b;

      particleVelocities[i3] = (Math.random() - 0.5) * 0.08;
      particleVelocities[i3 + 1] = 0.16 + Math.random() * 0.38;
      particleVelocities[i3 + 2] = (Math.random() - 0.5) * 0.05;

      particleSeeds[i] = Math.random() * 100;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    function createSoftParticleTexture() {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.25, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }

    const particleMat = new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      map: createSoftParticleTexture(),
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    let particleSpeedMultiplier = 1.0;

    /* ========================================================
       4. FEATHER FLUTTER DETACHMENT PHYSICS (FASE 1)
       ======================================================== */
    const fallingLeaves = [];

    function spawnDetachedFeatherLayer() {
      const leafMat = burlapMat.clone();
      leafMat.transparent = true;
      leafMat.opacity = 0.95;

      const leafMesh = new THREE.Mesh(patchGeo.clone(), leafMat);
      leafMesh.position.copy(burlapGroup.position);
      leafMesh.rotation.copy(burlapGroup.rotation);
      scene.add(leafMesh);

      fallingLeaves.push({
        mesh: leafMesh,
        birthTime: performance.now(),
        life: 2.1,
        vx: (Math.random() - 0.5) * 0.28,
        vy: -0.15,
        wobbleFreq: 3.5 + Math.random() * 1.5,
        wobbleAmp: 0.75 + Math.random() * 0.35,
        rotSpeedX: (Math.random() - 0.5) * 1.8,
        rotSpeedY: (Math.random() - 0.5) * 1.2,
        rotSpeedZ: (Math.random() - 0.5) * 1.5
      });
    }

    function updateFallingLeaves(now, dt) {
      for (let i = fallingLeaves.length - 1; i >= 0; i--) {
        const leaf = fallingLeaves[i];
        const age = (now - leaf.birthTime) / 1000;

        if (age >= leaf.life) {
          scene.remove(leaf.mesh);
          leaf.mesh.geometry.dispose();
          leaf.mesh.material.dispose();
          fallingLeaves.splice(i, 1);
          continue;
        }

        const fallSpeed = 0.85 + age * 0.5;
        leaf.mesh.position.y -= fallSpeed * dt;
        leaf.mesh.position.x += Math.sin(age * leaf.wobbleFreq) * leaf.wobbleAmp * dt + leaf.vx * dt;
        leaf.mesh.position.z += Math.cos(age * leaf.wobbleFreq * 0.7) * 0.2 * dt;

        leaf.mesh.rotation.x += leaf.rotSpeedX * dt;
        leaf.mesh.rotation.y += leaf.rotSpeedY * dt;
        leaf.mesh.rotation.z += Math.sin(age * leaf.wobbleFreq) * 1.2 * dt;

        const progress = age / leaf.life;
        leaf.mesh.material.opacity = Math.max(0, 1.0 - Math.pow(progress, 1.5));
      }
    }

    /* ========================================================
       5. FASE 2: COSMOS 3D COLLAGE FRAGMENTS (OLAFUR ELIASSON)
       ======================================================== */
    const cosmosGroup = new THREE.Group();
    cosmosGroup.visible = false;
    scene.add(cosmosGroup);

    const cosmosFragmentsData = [
      {
        id: 0,
        title: "Maracuyá",
        concept: "Maracuyá",
        technique: "Acrílico • 2025",
        quote: "La vibración del color y la materia orgánica en su máxima plenitud.",
        type: "maracuya",
        imgSrc: "assets/artworks/deckled/deckled_0.webp",
        pos: { x: -3.2, y: 1.5, z: -3.5 },
        rot: { x: 0.12, y: 0.35, z: -0.08 },
        scale: { w: 1.7, h: 2.2 }
      },
      {
        id: 1,
        title: "Cancelando",
        concept: "Cancelando",
        technique: "Técnica mixta & collage • 2025",
        quote: "Superposición de capas, veladuras y collage donde el pasado se resignifica.",
        type: "cancelado",
        imgSrc: "assets/artworks/deckled/deckled_1.webp",
        pos: { x: 3.4, y: 1.9, z: -4.8 },
        rot: { x: -0.15, y: -0.42, z: 0.12 },
        scale: { w: 1.7, h: 2.3 }
      },
      {
        id: 2,
        title: "Virapitá",
        concept: "Virapitá",
        technique: "Acrílico & textura • 2025",
        quote: "Las memorias del litoral y la tierra convertidas en materia viva.",
        type: "virapita",
        imgSrc: "assets/artworks/deckled/deckled_2.webp",
        pos: { x: -1.8, y: -2.0, z: -3.0 },
        rot: { x: -0.28, y: 0.22, z: 0.18 },
        scale: { w: 2.0, h: 1.5 }
      },
      {
        id: 3,
        title: "Sueños",
        concept: "Sueños",
        technique: "Técnica mixta • 2025",
        quote: "Entretejer los vacíos del recuerdo para que la memoria tome presencia.",
        type: "suenos",
        imgSrc: "assets/artworks/deckled/deckled_3.webp",
        pos: { x: 2.4, y: -1.7, z: -3.8 },
        rot: { x: 0.24, y: -0.32, z: -0.14 },
        scale: { w: 1.5, h: 1.9 }
      },
      {
        id: 4,
        title: "Chocolat d'Or",
        concept: "Chocolat d'Or",
        technique: "Técnica mixta & pan de oro • 2025",
        quote: "Destellos de pan de oro y tierra que rescatan la permanencia del tiempo.",
        type: "chocolat",
        imgSrc: "assets/artworks/deckled/deckled_4.webp",
        pos: { x: -4.2, y: -0.3, z: -6.2 },
        rot: { x: 0.08, y: 0.45, z: -0.22 },
        scale: { w: 1.8, h: 2.4 }
      },
      {
        id: 5,
        title: "El Inicio",
        concept: "El Inicio",
        technique: "Técnica mixta & grafismos • 2024",
        quote: "Los primeros trazos y la búsqueda libre de la forma en el lienzo.",
        type: "elinicio",
        imgSrc: "assets/artworks/deckled/deckled_5.webp",
        pos: { x: 1.4, y: 2.7, z: -6.8 },
        rot: { x: -0.22, y: -0.18, z: 0.05 },
        scale: { w: 2.1, h: 1.6 }
      },
      {
        id: 6,
        title: "Verano",
        concept: "Verano",
        technique: "Acrílico sobre lienzo • 2025",
        quote: "Fuerza lumínica y movimiento donde el color danza con vitalidad absoluta.",
        type: "verano",
        imgSrc: "assets/artworks/deckled/deckled_6.webp",
        pos: { x: 4.0, y: -0.6, z: -7.5 },
        rot: { x: 0.18, y: -0.48, z: 0.15 },
        scale: { w: 1.7, h: 2.2 }
      },
      {
        id: 7,
        title: "Disgregado",
        concept: "Disgregado",
        technique: "Técnica mixta & papel desgarrado • 2025",
        quote: "Papel desgarrado y memoria fragmentada que resiste al olvido.",
        type: "disgregado",
        imgSrc: "assets/artworks/deckled/deckled_7.webp",
        pos: { x: -2.0, y: 2.4, z: -8.2 },
        rot: { x: -0.12, y: 0.28, z: -0.16 },
        scale: { w: 1.6, h: 2.0 }
      },
      {
        id: 8,
        title: "San Colombano",
        concept: "San Colombano",
        technique: "Acrílico & sedimentos • 2024",
        quote: "Sedimentos minerales y silencio del río que evocan el origen.",
        type: "sancolombano",
        imgSrc: "assets/artworks/deckled/deckled_8.webp",
        pos: { x: 0.5, y: -2.5, z: -6.4 },
        rot: { x: 0.32, y: -0.12, z: 0.10 },
        scale: { w: 2.1, h: 1.7 }
      },
      {
        id: 9,
        title: "Araucaria",
        concept: "Araucaria",
        technique: "Acrílico & fibras de lino • 2024",
        quote: "Fibras de lino y pigmentos terrosos como testigo mudo de la naturaleza.",
        type: "araucaria",
        imgSrc: "assets/artworks/deckled/deckled_9.webp",
        pos: { x: -3.5, y: -2.3, z: -7.8 },
        rot: { x: -0.20, y: 0.38, z: 0.08 },
        scale: { w: 1.8, h: 2.2 }
      }
    ];

    function createDeckledShape(ctx, w, h, m) {
      ctx.beginPath();
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = m + t * (w - 2 * m);
        const y = m + (Math.sin(t * 24) * 3 + Math.cos(t * 48) * 2);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const y = m + t * (h - 2 * m);
        const x = (w - m) + (Math.sin(t * 26) * 3 + Math.cos(t * 52) * 2);
        ctx.lineTo(x, y);
      }
      for (let i = 0; i <= steps; i++) {
        const t = 1 - i / steps;
        const x = m + t * (w - 2 * m);
        const y = (h - m) + (Math.sin(t * 22) * 3 + Math.cos(t * 44) * 2);
        ctx.lineTo(x, y);
      }
      for (let i = 0; i <= steps; i++) {
        const t = 1 - i / steps;
        const y = m + t * (h - 2 * m);
        const x = m + (Math.sin(t * 28) * 3 + Math.cos(t * 56) * 2);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function createFragmentTexture(type) {
      const c = document.createElement('canvas');
      c.width = 512;
      c.height = 512;
      const ctx = c.getContext('2d');
      const w = 512, h = 512;

      ctx.clearRect(0, 0, w, h);

      ctx.save();
      createDeckledShape(ctx, w, h, 28);
      ctx.clip();

      if (type === 'solapado') {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0.0, '#1E494E');
        g.addColorStop(0.4, '#2E666C');
        g.addColorStop(1.0, '#1A3C40');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#C89344';
        ctx.fillRect(60, 180, 400, 110);
        ctx.fillStyle = '#9E3A20';
        ctx.fillRect(120, 240, 280, 80);

        ctx.fillStyle = 'rgba(235, 225, 205, 0.45)';
        ctx.fillRect(80, 80, 220, 60);

        ctx.strokeStyle = 'rgba(20, 15, 12, 0.65)';
        ctx.lineWidth = 3;
        ctx.strokeRect(90, 140, 320, 220);
      } 
      else if (type === 'prensa') {
        ctx.fillStyle = '#EBDCBA';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = 'rgba(50, 40, 30, 0.15)';
        ctx.fillRect(40, 40, 432, 40);

        ctx.fillStyle = 'rgba(40, 30, 20, 0.55)';
        for (let y = 110; y < 450; y += 14) {
          ctx.fillRect(50, y, 190, 4);
          ctx.fillRect(265, y, 195, 4);
        }

        ctx.save();
        ctx.translate(360, 340);
        ctx.rotate(-0.25);
        ctx.strokeStyle = 'rgba(160, 45, 30, 0.75)';
        ctx.lineWidth = 3;
        ctx.strokeRect(-50, -50, 100, 100);
        ctx.font = '600 13px "Cinzel", serif';
        ctx.fillStyle = 'rgba(160, 45, 30, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText('ULTRAMAR', 0, -10);
        ctx.fillText('1967', 0, 15);
        ctx.restore();
      }
      else if (type === 'arrozales') {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0.0, '#8A341A');
        g.addColorStop(0.5, '#682410');
        g.addColorStop(1.0, '#3D150A');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(215, 175, 110, 0.55)';
        ctx.lineWidth = 2.5;
        for (let y = 60; y < h; y += 45) {
          ctx.beginPath();
          ctx.moveTo(30, y);
          ctx.bezierCurveTo(180, y + 20, 340, y - 20, 480, y + 10);
          ctx.stroke();
        }

        ctx.font = 'italic 400 18px "Cormorant Garamond", serif';
        ctx.fillStyle = 'rgba(240, 220, 190, 0.7)';
        ctx.fillText('Taipas del Litoral', 70, 420);
      }
      else if (type === 'algodon') {
        ctx.fillStyle = '#F5EFE4';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#1A1410';
        ctx.fillRect(100, 120, 120, 160);
        ctx.fillRect(270, 200, 140, 180);

        ctx.strokeStyle = '#D4A455';
        ctx.lineWidth = 2;
        ctx.strokeRect(80, 90, 340, 320);

        ctx.font = 'italic 500 20px "Cormorant Garamond", serif';
        ctx.fillStyle = '#3A281A';
        ctx.fillText('El tejido de la memoria', 110, 80);
      }
      else if (type === 'citricos') {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0.0, '#4E5A35');
        g.addColorStop(0.6, '#735028');
        g.addColorStop(1.0, '#3A2412');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#D69E38';
        ctx.beginPath();
        ctx.arc(260, 240, 90, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(240, 225, 200, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(90, 90, 330, 330);
      }
      else if (type === 'arquitectura') {
        ctx.fillStyle = '#26333D';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        for (let x = 40; x < w; x += 30) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
        }
        for (let y = 40; y < h; y += 30) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        }

        ctx.strokeStyle = '#C9A36A';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(256, 256, 120, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '600 15px "Cinzel", serif';
        ctx.fillStyle = '#E8D2B0';
        ctx.fillText('TALLER TIGRE', 180, 260);
      }
      else if (type === 'chocolat') {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0.0, '#2D1B12');
        g.addColorStop(0.7, '#1A0E08');
        g.addColorStop(1.0, '#0E0704');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#D8AA42';
        ctx.fillRect(160, 160, 190, 190);

        ctx.fillStyle = 'rgba(245, 235, 220, 0.7)';
        ctx.fillRect(130, 130, 80, 80);
      }
      else if (type === 'disgregado') {
        ctx.fillStyle = 'rgba(28, 20, 14, 0.6)';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = 'rgba(220, 190, 150, 0.35)';
        ctx.lineWidth = 2;
        for (let y = 30; y < h; y += 18) {
          ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(482, y); ctx.stroke();
        }
        for (let x = 30; x < w; x += 18) {
          ctx.beginPath(); ctx.moveTo(x, 30); ctx.lineTo(x, 482); ctx.stroke();
        }
      }
      else if (type === 'acrilico') {
        ctx.fillStyle = '#8E381C';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#C85C36';
        ctx.fillRect(60, 80, 380, 160);

        ctx.fillStyle = '#EAD6B8';
        ctx.fillRect(100, 220, 300, 140);

        ctx.fillStyle = '#2A180E';
        ctx.fillRect(150, 140, 180, 200);
      }
      else { // araucaria
        ctx.fillStyle = '#C29858';
        ctx.fillRect(0, 0, w, h);

        ctx.fillStyle = '#2A3822';
        ctx.beginPath();
        ctx.moveTo(256, 80);
        ctx.lineTo(390, 420);
        ctx.lineTo(122, 420);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 245, 225, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(60, 60, 392, 392);
      }

      ctx.restore();

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 8;
      return tex;
    }

    const cosmosTexLoader = new THREE.TextureLoader();

    function createArtworkFragmentTexture(data) {
      const b64 = (window.COSMOS_ARTWORK_TEXTURES && window.COSMOS_ARTWORK_TEXTURES[data.type]) || null;
      if (b64) {
        const tex = cosmosTexLoader.load(b64, (loadedTex) => {
          loadedTex.anisotropy = 8;
          loadedTex.generateMipmaps = true;
          loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
          loadedTex.magFilter = THREE.LinearFilter;
        });
        tex.anisotropy = 8;
        return tex;
      }
      if (data && data.imgSrc) {
        const tex = cosmosTexLoader.load(data.imgSrc);
        tex.anisotropy = 8;
        return tex;
      }
      return createFragmentTexture(data.type);
    }

    
    // Embedded Bibi Lacoste Climax Portrait (Zero CORS, 100% offline & file:/// compatible)
    const solapadoB64 = "data:image/webp;base64,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";
    const solapadoTexLoader = new THREE.TextureLoader();
    let solapadoCanvasTexture = null;
    try {
      solapadoCanvasTexture = solapadoTexLoader.load(solapadoB64, (t) => {
        t.anisotropy = 4;
        if (solapadoMasterMesh) {
          solapadoMasterMesh.material.map = t;
          solapadoMasterMesh.material.needsUpdate = true;
        }
      });
    } catch(e) {
      solapadoCanvasTexture = createFragmentTexture('solapado');
    }


    
    /* ========================================================
       PHASE 3: MATERIC ASSEMBLAGE & CLIMAX SETUP
       ======================================================== */
    let cosmosTime = 0.0;
    let assembleBtnVisible = false;
    let assembleProgress = 0.0;
    const assembleDuration = 3.6;

    let needleMesh = null;
    let solapadoMasterMesh = null;
    let solapadoFrameMesh = null;
    let gallerySpotlight = null;
    let fragmentStartTransforms = [];

    // 1. Create Compass Needle Mesh
    function createCompassNeedleMesh() {
      const needleGroup = new THREE.Group();

      const northShape = new THREE.Shape();
      northShape.moveTo(0, 0);
      northShape.lineTo(-0.11, 0);
      northShape.lineTo(0, 1.25);
      northShape.lineTo(0.11, 0);
      northShape.closePath();

      const southShape = new THREE.Shape();
      southShape.moveTo(0, 0);
      southShape.lineTo(-0.11, 0);
      southShape.lineTo(0, -1.25);
      southShape.lineTo(0.11, 0);
      southShape.closePath();

      const extrudeSettings = { depth: 0.03, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.015, bevelThickness: 0.015 };
      const northGeo = new THREE.ExtrudeGeometry(northShape, extrudeSettings);
      const southGeo = new THREE.ExtrudeGeometry(southShape, extrudeSettings);

      const northMat = new THREE.MeshStandardMaterial({
        color: 0xC89344,
        roughness: 0.28,
        metalness: 0.88,
        emissive: 0x553010,
        emissiveIntensity: 0.2
      });

      const southMat = new THREE.MeshStandardMaterial({
        color: 0x6E5638,
        roughness: 0.35,
        metalness: 0.82
      });

      const northMesh = new THREE.Mesh(northGeo, northMat);
      const southMesh = new THREE.Mesh(southGeo, southMat);
      needleGroup.add(northMesh);
      needleGroup.add(southMesh);

      // Central Brass Axis Ring & Cap
      const ringGeo = new THREE.TorusGeometry(0.15, 0.035, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xE8BF8D, roughness: 0.25, metalness: 0.92 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.z = 0.02;
      needleGroup.add(ringMesh);

      const centerCapGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 24);
      centerCapGeo.rotateX(Math.PI / 2);
      const centerCapMat = new THREE.MeshStandardMaterial({ color: 0xD6A46A, roughness: 0.2, metalness: 0.95 });
      const centerCapMesh = new THREE.Mesh(centerCapGeo, centerCapMat);
      centerCapMesh.position.z = 0.04;
      needleGroup.add(centerCapMesh);

      needleGroup.scale.set(0.1, 0.1, 0.1);
      needleGroup.visible = false;
      return needleGroup;
    }

    // 2. Assemblage Target Matrix (Where fragments land on canvas)
    const fragmentTargetLayout = [
      { pos: { x: -0.55, y: 0.85, z: -4.15 }, rot: { x: 0, y: 0, z: 0.02 }, scale: 0.95, layer: 3 },
      { pos: { x: 0.60, y: 0.95, z: -4.17 }, rot: { x: 0, y: 0, z: -0.02 }, scale: 0.90, layer: 1 },
      { pos: { x: -0.65, y: -0.80, z: -4.16 }, rot: { x: 0, y: 0, z: 0.03 }, scale: 0.92, layer: 1 },
      { pos: { x: 0.55, y: -0.75, z: -4.16 }, rot: { x: 0, y: 0, z: -0.01 }, scale: 0.88, layer: 2 },
      { pos: { x: -0.15, y: 0.10, z: -4.14 }, rot: { x: 0, y: 0, z: 0.04 }, scale: 0.85, layer: 2 },
      { pos: { x: 0.45, y: 0.15, z: -4.16 }, rot: { x: 0, y: 0, z: -0.03 }, scale: 0.85, layer: 2 },
      { pos: { x: 0.05, y: -0.45, z: -4.13 }, rot: { x: 0, y: 0, z: 0.02 }, scale: 0.80, layer: 3 },
      { pos: { x: -0.75, y: 0.05, z: -4.15 }, rot: { x: 0, y: 0, z: -0.04 }, scale: 0.85, layer: 2 },
      { pos: { x: 0.08, y: 1.15, z: -4.15 }, rot: { x: 0, y: 0, z: 0.01 }, scale: 0.90, layer: 3 },
      { pos: { x: 0.70, y: -1.05, z: -4.14 }, rot: { x: 0, y: 0, z: -0.02 }, scale: 0.85, layer: 3 }
    ];


    function getAssemblageTargetCameraDistance() {
      const aspect = getScreenAspect();
      return Math.max(8.6, 6.66 / Math.max(0.35, aspect));
    }

    let assembleCamStartPos = null;
    let assembleCamStartLookAt = null;
    let assembleCamTargetLookAt = null;
    let assembleCamTargetPos = null;

    // 4. Start Assemblage Phase
    function startAssemblagePhase() {
      if (appState !== 'COSMOS') return;
      assembleCamStartPos = camera.position.clone();
      assembleCamStartLookAt = new THREE.Vector3(0, 0, -5.2);
      assembleCamTargetLookAt = new THREE.Vector3(0, 0.15, -4.10);
      const targetDist = getAssemblageTargetCameraDistance();
      assembleCamTargetPos = new THREE.Vector3(0, 0.15, -4.10 + targetDist);
      if (appState !== 'COSMOS') return;
      appState = 'ASSEMBLING';
      assembleProgress = 0.0;

      // Ensure burlap group and any floating leaves are completely hidden
      if (burlapGroup) {
        burlapGroup.visible = false;
        burlapMat.opacity = 0.0;
      }
      if (fallingLeaves && fallingLeaves.length > 0) {
        fallingLeaves.forEach(l => {
          scene.remove(l.mesh);
          if (l.mesh.geometry) l.mesh.geometry.dispose();
          if (l.mesh.material) l.mesh.material.dispose();
        });
        fallingLeaves.length = 0;
      }

      const assembleBtn = document.getElementById('assemble-btn-container');
      if (assembleBtn) assembleBtn.classList.remove('visible');

      const cosmosNav = document.getElementById('cosmos-nav-bar');
      if (cosmosNav) cosmosNav.classList.remove('visible');

      currentActiveFragmentData = null;
      const quoteCard = document.getElementById('cosmos-quote-card');
      if (quoteCard) quoteCard.classList.remove('visible');
      if (typeof updateCosmosCardContent === 'function') updateCosmosCardContent(null);

      // Hide bottom sound toggle bar during climax so Ingresar button is pristine
      const bottomBar = document.querySelector('.bottom-bar');
      if (bottomBar) bottomBar.style.opacity = '0';

      playMagneticThudSound();
      if (navigator.vibrate) {
        try { navigator.vibrate(30); } catch(e) {}
      }

      fragmentStartTransforms = fragmentMeshes.map(m => ({
        pos: m.position.clone(),
        rot: m.rotation.clone(),
        scale: m.scale.x
      }));

      if (needleMesh) {
        needleMesh.position.set(0, 0.15, -4.05);
        needleMesh.rotation.set(0, 0, Math.PI / 2);
        needleMesh.scale.set(0.1, 0.1, 0.1);
        needleMesh.visible = true;
      }
    }


    
    // Master Artwork Mesh: Bibi Lacoste Climax Portrait
    const solapadoGeo = new THREE.PlaneGeometry(3.17, 4.25);

    const solapadoMat = new THREE.MeshBasicMaterial({
      map: solapadoCanvasTexture || createFragmentTexture('solapado'),
      transparent: true,
      opacity: 0.0,
      toneMapped: false,
      side: THREE.DoubleSide
    });
    solapadoMasterMesh = new THREE.Mesh(solapadoGeo, solapadoMat);
    solapadoMasterMesh.position.set(0, 0.15, -4.10);
    solapadoMasterMesh.visible = false;
    scene.add(solapadoMasterMesh);

    // Floating Dark Walnut Wood Frame
    const frameGeo = new THREE.BoxGeometry(3.38, 4.46, 0.12);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x181310,
      roughness: 0.85,
      metalness: 0.10,
      transparent: true,
      opacity: 0.0
    });
    solapadoFrameMesh = new THREE.Mesh(frameGeo, frameMat);
    solapadoFrameMesh.position.set(0, 0.15, -4.22);
    solapadoFrameMesh.visible = false;
    scene.add(solapadoFrameMesh);

    // Authentic Brass Navigation Needle
    needleMesh = createCompassNeedleMesh();
    scene.add(needleMesh);

    // Museum Gallery Spotlight
    gallerySpotlight = new THREE.SpotLight(0xFFEEDD, 0.0, 16, Math.PI / 4.2, 0.4, 1.2);
    gallerySpotlight.position.set(-2.2, 4.2, 0.8);
    gallerySpotlight.target = solapadoMasterMesh;
    scene.add(gallerySpotlight);


    const fragmentMeshes = [];

    cosmosFragmentsData.forEach((data, idx) => {
      const geo = new THREE.PlaneGeometry(data.scale.w, data.scale.h, 12, 12);
      
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i) / data.scale.w;
        const v = pos.getY(i) / data.scale.h;
        const curl = Math.sin(u * Math.PI) * 0.04 - Math.cos(v * Math.PI) * 0.03;
        pos.setZ(i, curl);
      }
      geo.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        map: createArtworkFragmentTexture(data),
        transparent: true,
        opacity: 0.0,
        roughness: 0.88,
        metalness: 0.04,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(0x000000)
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(data.pos.x, data.pos.y, data.pos.z);
      mesh.rotation.set(data.rot.x, data.rot.y, data.rot.z);
      mesh.userData = {
        data: data,
        basePos: { ...data.pos },
        baseRot: { ...data.rot },
        floatPhase: idx * 1.35,
        targetScale: 1.0,
        currentScale: 1.0,
        targetEmissive: 0.0
      };

      cosmosGroup.add(mesh);
      fragmentMeshes.push(mesh);
    });

    /* ========================================================
       6. PROGRESSIVE DISCOVERY (FASE 1) & TRANSITION TO COSMOS
       ======================================================== */
    const layersData = [
      { text: "Toda memoria", title: "Tierra y origen", desc: "Taipas de arroz" },
      { text: "es un viaje", title: "Desarraigo", desc: "Distancias de ultramar" },
      { text: "que busca", title: "Oficios", desc: "Cítricos que transforman paisajes" },
      { text: "su rumbo.", title: "Memoria", desc: "El papel como recuerdo" }
    ];

    const feedbackEl = document.getElementById('layer-feedback');

    function advanceBurlapStep() {
      if (appState !== 'FASE1') return;

      if (currentStep < 4) {
        spawnDetachedFeatherLayer();

        const node = document.getElementById(`node-${currentStep}`);
        if (node) node.classList.add('revealed');

        const dot = document.getElementById(`dot-${currentStep}`);
        if (dot) dot.classList.add('active');

        playBurlapTearSound(currentStep);
        drawBurlapLayer(currentStep + 1);

        const stepIdx = currentStep;
        currentStep++;

        const t = window.t || ((k, f) => f);
        const title = t(`experience.step${stepIdx}Title`, layersData[stepIdx].title);
        const desc = t(`experience.step${stepIdx}Desc`, layersData[stepIdx].desc);

        feedbackEl.innerHTML = `<span style="color:#D6A46A; letter-spacing:0.24em; font-size:0.75rem; font-family:'Cinzel', serif;">• ${title.toUpperCase()} •</span><br><span style="font-family:'Cormorant Garamond', serif; font-style:italic; font-size:1.15rem; color:#EBD9C8; letter-spacing:0.04em;">${desc}</span>`;

        if (currentStep === 4) {
          isUnlocked = true;
          canvas.classList.add('unlocked');
          playHarmonicMemoryChime();

          setTimeout(() => {
            if (appState === 'FASE1') {
              const readyTitle = t('experience.readyTitle', '• EL RUMBO ESTÁ TRAZADO •');
              const readyDesc = t('experience.readyDesc', 'Toca para abrir el cosmos');
              feedbackEl.innerHTML = `<span style="color:#E2B886; letter-spacing:0.28em; font-size:0.75rem; font-family:'Cinzel', serif;">${readyTitle}</span><br><span style="font-family:'Cormorant Garamond', serif; font-style:italic; font-size:1.15rem; color:#FFF0D4; letter-spacing:0.04em;">${readyDesc}</span>`;
            }
          }, 1600);
        }
      } else {
        triggerCosmosTransition();
      }
    }

    let transitionStartTime = 0;
    const transitionDuration = 2.4;

    function triggerCosmosTransition() {
      // Clear detached falling leaves so they don't linger in cosmos
      if (fallingLeaves && fallingLeaves.length > 0) {
        fallingLeaves.forEach(leaf => {
          scene.remove(leaf.mesh);
          if (leaf.mesh.geometry) leaf.mesh.geometry.dispose();
          if (leaf.mesh.material) leaf.mesh.material.dispose();
        });
        fallingLeaves.length = 0;
      }
      if (appState !== 'FASE1') return;
      appState = 'TRANSITION';
      transitionStartTime = performance.now();

      playCosmosTransitionSound();

      const n0 = document.getElementById('node-0');
      const n1 = document.getElementById('node-1');
      const n2 = document.getElementById('node-2');
      const n3 = document.getElementById('node-3');

      if (n0) { n0.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease'; n0.style.transform = 'translate(-280%, -240%) scale(0.5)'; n0.style.opacity = '0'; }
      if (n1) { n1.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease'; n1.style.transform = 'translate(280%, -240%) scale(0.5)'; n1.style.opacity = '0'; }
      if (n2) { n2.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease'; n2.style.transform = 'translate(280%, 240%) scale(0.5)'; n2.style.opacity = '0'; }
      if (n3) { n3.style.transition = 'transform 1.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s ease'; n3.style.transform = 'translate(-280%, 240%) scale(0.5)'; n3.style.opacity = '0'; }

      const svgThread = document.getElementById('constellation-svg');
      if (svgThread) {
        svgThread.style.transition = 'opacity 1.0s ease';
        svgThread.style.opacity = '0';
      }

      if (feedbackEl) {
        feedbackEl.style.transition = 'opacity 0.8s ease';
        feedbackEl.style.opacity = '0';
      }

      const pills = document.querySelector('.progress-pills');
      if (pills) {
        pills.style.transition = 'opacity 0.8s ease';
        pills.style.opacity = '0';
      }
    }

    /* ========================================================
       7. CONSTELLATION SVG THREAD DYNAMICS (RESPONSIVE)
       ======================================================== */
    const nodes = [
      document.getElementById('node-0'),
      document.getElementById('node-1'),
      document.getElementById('node-2'),
      document.getElementById('node-3')
    ];

    const threadPath = document.getElementById('thread-path');

    const nodeOscillations = [
      { speed: 0.8, phase: 0.0, ampX: 7, ampY: 9 },
      { speed: 0.7, phase: 1.5, ampX: 9, ampY: 7 },
      { speed: 0.9, phase: 3.0, ampX: 7, ampY: 10 },
      { speed: 0.75, phase: 4.5, ampX: 8, ampY: 8 }
    ];

    function splitCubicBezier(p0, p1, p2, p3, t) {
      const u = 1 - t;
      const p01 = { x: u * p0.x + t * p1.x, y: u * p0.y + t * p1.y };
      const p12 = { x: u * p1.x + t * p2.x, y: u * p1.y + t * p2.y };
      const p23 = { x: u * p2.x + t * p3.x, y: u * p2.y + t * p3.y };

      const p012 = { x: u * p01.x + t * p12.x, y: u * p01.y + t * p12.y };
      const p123 = { x: u * p12.x + t * p23.x, y: u * p12.y + t * p23.y };

      const p0123 = { x: u * p012.x + t * p123.x, y: u * p012.y + t * p123.y };

      return { cp1: p01, cp2: p012, end: p0123 };
    }

    let threadProgress = 0;

    function updateConstellation(time, dt, mouseParallaxX, mouseParallaxY) {
      if (appState !== 'FASE1') return;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 640 || h > w;
      const points = [];

      // Responsive Anchors: On narrow screens, place comfortably inside margins
      const anchorNorms = isMobile ? [
        { x: 0.28, y: 0.20 }, // Node 0
        { x: 0.72, y: 0.24 }, // Node 1
        { x: 0.74, y: 0.72 }, // Node 2
        { x: 0.28, y: 0.68 }  // Node 3
      ] : [
        { x: 0.16, y: 0.22 },
        { x: 0.82, y: 0.25 },
        { x: 0.84, y: 0.72 },
        { x: 0.17, y: 0.70 }
      ];

      const minMarginX = isMobile ? 65 : 95;
      const minMarginY = isMobile ? 70 : 80;

      nodes.forEach((node, idx) => {
        const anchor = anchorNorms[idx];
        const baseX = anchor.x * w;
        const baseY = anchor.y * h;
        const osc = nodeOscillations[idx];

        let curX = baseX + Math.sin(time * osc.speed + osc.phase) * osc.ampX + mouseParallaxX * 12 * (idx % 2 === 0 ? 1 : -1);
        let curY = baseY + Math.cos(time * osc.speed + osc.phase) * osc.ampY + mouseParallaxY * 12 * (idx < 2 ? 1 : -1);

        // Clamp safely so text and pins never clip outside the viewport
        curX = Math.max(minMarginX, Math.min(w - minMarginX, curX));
        curY = Math.max(minMarginY, Math.min(h - minMarginY, curY));

        node.style.left = `${curX}px`;
        node.style.top = `${curY}px`;

        points.push({ x: curX, y: curY + 24 });
      });

      const targetProgress = Math.max(0, currentStep - 1);

      if (threadProgress < targetProgress) {
        threadProgress = Math.min(targetProgress, threadProgress + dt * 0.85);
      }

      if (threadProgress > 0 && points.length >= 2) {
        let d = `M ${points[0].x} ${points[0].y}`;
        const totalSegments = Math.min(3, points.length - 1);

        for (let i = 0; i < totalSegments; i++) {
          if (threadProgress <= i) break;

          const p0 = points[i];
          const p3 = points[i + 1];
          const cp1 = { x: p0.x + (p3.x - p0.x) * 0.5, y: p0.y - 25 };
          const cp2 = { x: p3.x - (p3.x - p0.x) * 0.2, y: p3.y - 30 };

          if (threadProgress >= i + 1) {
            d += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p3.x} ${p3.y}`;
          } else {
            const t = threadProgress - i;
            const easeT = t * (2 - t);
            const sub = splitCubicBezier(p0, cp1, cp2, p3, Math.max(0.001, Math.min(1.0, easeT)));
            d += ` C ${sub.cp1.x} ${sub.cp1.y}, ${sub.cp2.x} ${sub.cp2.y}, ${sub.end.x} ${sub.end.y}`;
            break;
          }
        }
        threadPath.setAttribute('d', d);
      } else {
        threadPath.setAttribute('d', '');
      }
    }

    /* ========================================================
       8. INTERACTION & RAYCASTING DYNAMICS (ROBUST TOUCH & MOUSE)
       ======================================================== */
    let mouseNorm = { x: 0, y: 0 };
    let mousePixels = { x: 0, y: 0 };
    let targetTilt = { x: basePose.rotX, y: basePose.rotY };
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let freeRotation = { x: 0, y: 0 };

    // Fluid Cosmos Camera Controls
    let targetZoom = 1.8;
    let currentZoom = 1.8;
    let targetYaw = 0.0;
    let currentYaw = 0.0;
    let targetPitch = 0.0;
    let currentPitch = 0.0;
    let parallax = { x: 0, y: 0 };



    let isTouch = false;
    let touchStart = { x: 0, y: 0 };
    let touchMoveDist = 0;
    let initialPinchDist = null;
    let initialPinchZoom = null;

    const raycaster = new THREE.Raycaster();
    let hoveredFragment = null;
    let quoteCardTimer = null;
    let currentActiveFragmentData = null;

    const quoteCard = document.getElementById('cosmos-quote-card');
    const quoteTag = document.getElementById('quote-tag');
    const quoteText = document.getElementById('quote-text');

    function updateCosmosCardContent(data) {
      if (!quoteCard || !quoteTag || !quoteText) return;
      const t = window.t || ((k, f) => f);
      if (!data) {
        quoteTag.textContent = t('cosmos.tag', '• MATERIA & ESTRATOS •');
        quoteText.textContent = `"${t('cosmos.quote', 'Pinceladas minerales de turquesa y tierra donde el óleo encuentra su asiento.')}"`;
        return;
      }
      const key = data.type || data.id;
      const translatedTitle = t(`cosmosFragments.${key}.title`, data.title || data.concept);
      const translatedQuote = t(`cosmosFragments.${key}.quote`, data.quote);

      quoteTag.textContent = `• ${translatedTitle.toUpperCase()} •`;
      quoteText.textContent = `"${translatedQuote}"`;
    }

    // MOUSE EVENTS (DESKTOP)
    window.addEventListener('mousedown', (e) => {
      if (isTouch || isCatalogInteraction(e) || window.scrollY > 80) return;
      initAudio();

      if (appState === 'FASE1') {
        advanceBurlapStep();
        return;
      }

      if (appState === 'COSMOS') {
        isDragging = true;
        prevMouse.x = e.clientX;
        prevMouse.y = e.clientY;
        checkFragmentInteraction();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isTouch || isCatalogInteraction() || window.scrollY > 80) return;
      mousePixels.x = e.clientX;
      mousePixels.y = e.clientY;
      mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (appState === 'FASE1') {
        if (!isUnlocked) {
          targetTilt.x = basePose.rotX + mouseNorm.y * 0.22;
          targetTilt.y = basePose.rotY + mouseNorm.x * 0.28;
        } else if (isDragging) {
          const dx = e.clientX - prevMouse.x;
          const dy = e.clientY - prevMouse.y;
          freeRotation.y += dx * 0.008;
          freeRotation.x += dy * 0.008;
          prevMouse.x = e.clientX;
          prevMouse.y = e.clientY;
        }
      } else if (appState === 'COSMOS') {
        parallax.x = mouseNorm.x * 0.35;
        parallax.y = mouseNorm.y * 0.25;

        if (isDragging) {
          const dx = e.clientX - prevMouse.x;
          const dy = e.clientY - prevMouse.y;
          targetYaw -= dx * 0.0042;
          targetPitch = Math.max(-0.45, Math.min(0.45, targetPitch + dy * 0.0035));
          prevMouse.x = e.clientX;
          prevMouse.y = e.clientY;
        }

        checkFragmentInteraction();
      }
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // MOUSE WHEEL ZOOM
    window.addEventListener('wheel', (e) => {
      if (appState !== 'COSMOS') return;
      e.preventDefault();
      const zoomStep = Math.sign(e.deltaY) * 0.65;
      targetZoom = Math.max(-2.8, Math.min(6.5, targetZoom + zoomStep));
    }, { passive: false });

    // TOUCH EVENTS (MOBILE & TABLET: DIRECT FLUID ORBIT & PINCH)
    window.addEventListener('touchstart', (e) => {
      if (isCatalogInteraction(e) || window.scrollY > 80) return;
      isTouch = true;
      initAudio();

      if (e.touches.length === 1) {
        touchStart.x = e.touches[0].clientX;
        touchStart.y = e.touches[0].clientY;
        prevMouse.x = e.touches[0].clientX;
        prevMouse.y = e.touches[0].clientY;
        touchMoveDist = 0;
        isDragging = true;
      } else if (e.touches.length === 2 && appState === 'COSMOS') {
        isDragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
        initialPinchZoom = targetZoom;
      }
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (isCatalogInteraction(e) || window.scrollY > 80 || appState === 'FASE3') return;
      if (e.cancelable) e.preventDefault();
      if (e.touches.length === 1 && isDragging) {
        const cx = e.touches[0].clientX;
        const cy = e.touches[0].clientY;
        const dx = cx - prevMouse.x;
        const dy = cy - prevMouse.y;
        touchMoveDist += Math.hypot(dx, dy);

        if (appState === 'FASE1' && isUnlocked) {
          freeRotation.y += dx * 0.009;
          freeRotation.x += dy * 0.009;
        } else if (appState === 'COSMOS') {
          // Direct 1-finger orbit without fighting parallax
          targetYaw -= dx * 0.0060;
          targetPitch = Math.max(-0.55, Math.min(0.55, targetPitch + dy * 0.0045));
        }

        prevMouse.x = cx;
        prevMouse.y = cy;
      } else if (e.touches.length === 2 && initialPinchDist !== null && appState === 'COSMOS') {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const pinchDelta = (initialPinchDist - dist) * 0.016;
        targetZoom = Math.max(-2.8, Math.min(7.0, initialPinchZoom + pinchDelta));
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      if (isCatalogInteraction(e)) return;
      if (e.touches.length === 0) {
        // Quick clean tap detection (finger didn't drag)
        if (touchMoveDist < 9) {
          if (appState === 'FASE1') {
            advanceBurlapStep();
          } else if (appState === 'COSMOS') {
            mouseNorm.x = (touchStart.x / window.innerWidth) * 2 - 1;
            mouseNorm.y = -(touchStart.y / window.innerHeight) * 2 + 1;
            checkFragmentInteraction();
          }
        }
        isDragging = false;
        initialPinchDist = null;
      } else if (e.touches.length === 1) {
        initialPinchDist = null;
        prevMouse.x = e.touches[0].clientX;
        prevMouse.y = e.touches[0].clientY;
        isDragging = true;
      }
    });

    function checkFragmentInteraction() {
      if (appState !== 'COSMOS') return;

      raycaster.setFromCamera(mouseNorm, camera);
      const intersects = raycaster.intersectObjects(fragmentMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hoveredFragment !== hit) {
          if (hoveredFragment) {
            hoveredFragment.userData.targetScale = 1.0;
            hoveredFragment.userData.targetEmissive = 0.0;
          }
          hoveredFragment = hit;
          hoveredFragment.userData.targetScale = 1.15;
          hoveredFragment.userData.targetEmissive = 0.45;

          const data = hit.userData.data;
          currentActiveFragmentData = data;
          updateCosmosCardContent(data);
          quoteCard.classList.add('visible');

          playFragmentChime(data.id);

          clearTimeout(quoteCardTimer);
          quoteCardTimer = setTimeout(() => {
            if (!hoveredFragment) quoteCard.classList.remove('visible');
          }, 4500);
        }
      } else {
        if (hoveredFragment) {
          hoveredFragment.userData.targetScale = 1.0;
          hoveredFragment.userData.targetEmissive = 0.0;
          hoveredFragment = null;
        }
      }
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      if (appState === 'FASE1') {
        camera.position.z = getResponsiveCameraZ();
      } else if (appState === 'FASE3') {
        const targetDist = getAssemblageTargetCameraDistance();
        camera.position.set(0, 0.15, -4.10 + targetDist);
        camera.lookAt(0, 0.15, -4.10);
        camera.up.set(0, 1, 0);
      }
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });


    /* ========================================================
       10. MAIN ANIMATION LOOP
       ======================================================== */
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const now = performance.now();

      // 1. UPDATE PARTICLES (Volumetric Polvo de Ladrillo & Gold Dust)
      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const baseVy = particleVelocities[i3 + 1];
        const seed = particleSeeds[i];

        positions[i3 + 1] -= baseVy * particleSpeedMultiplier * delta * 2.2;
        positions[i3] += Math.sin(time * 0.8 + seed) * 0.08 * delta;

        if (appState === 'TRANSITION') {
          positions[i3 + 2] += (particleSpeedMultiplier * 1.6) * delta;
        }

        if (positions[i3 + 1] < -14) {
          positions[i3 + 1] = 14;
          positions[i3] = (Math.random() - 0.5) * 36;
          positions[i3 + 2] = (Math.random() - 0.5) * 32 - 2;
        }

        if (positions[i3 + 2] > 10) {
          positions[i3 + 2] = -22;
        }
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      // 2. STATE SPECIFIC UPDATES
      if (appState === 'FASE1') {
        const idleFloatY = Math.sin(time * 0.8) * 0.04;
        const idleRollZ = Math.sin(time * 0.6) * 0.02;

        burlapGroup.position.y = 0.18 + idleFloatY;

        const targetRotX = targetTilt.x + freeRotation.x;
        const targetRotY = targetTilt.y + freeRotation.y;
        const targetRotZ = basePose.rotZ + idleRollZ;

        burlapGroup.rotation.x += (targetRotX - burlapGroup.rotation.x) * 0.06;
        burlapGroup.rotation.y += (targetRotY - burlapGroup.rotation.y) * 0.06;
        burlapGroup.rotation.z += (targetRotZ - burlapGroup.rotation.z) * 0.06;

        updateFallingLeaves(now, delta);
        updateConstellation(time, delta, isTouch ? 0 : mouseNorm.x, isTouch ? 0 : mouseNorm.y);
      } 
      else if (appState === 'TRANSITION') {
        const elapsed = (now - transitionStartTime) / 1000;
        const progress = Math.min(1.0, elapsed / transitionDuration);

        const ease = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        burlapGroup.scale.setScalar(1.0 + ease * 4.4);
        burlapGroup.position.z = 0.0 + ease * 2.8;
        burlapMat.opacity = Math.max(0, 1.0 - ease * 1.35);

        const startZ = getResponsiveCameraZ();
        const endZ = isMobileDevice() ? 3.0 : 1.8;
        camera.position.z = THREE.MathUtils.lerp(startZ, endZ, ease);

        const fovWarp = Math.sin(progress * Math.PI) * 24;
        camera.fov = 35 + fovWarp;
        camera.updateProjectionMatrix();

        particleSpeedMultiplier = 1.0 + Math.sin(progress * Math.PI) * 14.0;

        if (progress > 0.40) {
          cosmosGroup.visible = true;
          const cosmosFade = (progress - 0.40) / 0.60;
          fragmentMeshes.forEach(mesh => {
            mesh.material.opacity = cosmosFade;
          });
        }

        if (progress >= 1.0) {
          appState = 'COSMOS';
          burlapGroup.visible = false;
          particleSpeedMultiplier = 1.35;
          camera.fov = 42;
          camera.updateProjectionMatrix();

          canvas.classList.add('cosmos-mode');

          const cosmosNav = document.getElementById('cosmos-nav-bar');
          if (cosmosNav) cosmosNav.classList.add('visible');

          const brandContainer = document.getElementById('brand-container');
          if (brandContainer) {
            brandContainer.innerHTML = getTopBrandHtml();
          }
        }
      }
      else if (appState === 'COSMOS') {
        cosmosTime += delta;
        
        // Show assemble button after 5 seconds in cosmos
        if (cosmosTime >= 5.0 && !assembleBtnVisible) {
          assembleBtnVisible = true;
          const assembleBtnContainer = document.getElementById('assemble-btn-container');
          if (assembleBtnContainer) {
            assembleBtnContainer.classList.add('visible');
          }
        }

        currentZoom += (targetZoom - currentZoom) * 0.085;
        currentYaw += (targetYaw - currentYaw) * 0.085;
        currentPitch += (targetPitch - currentPitch) * 0.085;

        // Apply mouse parallax only on desktop (not when touch is active)
        const totalYaw = currentYaw + (isTouch ? 0 : parallax.x * 0.28);
        const totalPitch = currentPitch + (isTouch ? 0 : parallax.y * 0.20);

        const centerZ = -5.2;
        // On mobile portrait, adjust base radius so fragments fit comfortably in field of view
        const portraitMultiplier = getScreenAspect() < 1.0 ? 1.0 / Math.max(0.58, getScreenAspect() * 1.3) : 1.0;
        const radius = Math.max(1.8, (currentZoom + 5.2) * portraitMultiplier);

        const camX = Math.sin(totalYaw) * radius * Math.cos(totalPitch);
        const camY = Math.sin(totalPitch) * radius;
        const camZ = centerZ + Math.cos(totalYaw) * radius * Math.cos(totalPitch);

        camera.position.set(camX, camY, camZ);
        camera.lookAt(0, 0, centerZ);

        // Floating Fragments Organic Breathing
        fragmentMeshes.forEach((mesh, idx) => {
          const bp = mesh.userData.basePos;
          const br = mesh.userData.baseRot;
          const phase = mesh.userData.floatPhase;

          mesh.position.y = bp.y + Math.sin(time * 0.75 + phase) * 0.12;
          mesh.position.x = bp.x + Math.cos(time * 0.55 + phase * 1.4) * 0.08;
          mesh.position.z = bp.z + Math.sin(time * 0.65 + phase * 0.8) * 0.08;

          mesh.rotation.x = br.x + Math.sin(time * 0.6 + phase) * 0.06;
          mesh.rotation.y = br.y + Math.cos(time * 0.5 + phase * 1.2) * 0.08;
          mesh.rotation.z = br.z + Math.sin(time * 0.7 + phase * 0.5) * 0.04;

          mesh.userData.currentScale += (mesh.userData.targetScale - mesh.userData.currentScale) * 0.1;
          mesh.scale.setScalar(mesh.userData.currentScale);

          const curEm = mesh.material.emissive.r;
          const targetEm = mesh.userData.targetEmissive;
          const nextEm = curEm + (targetEm - curEm) * 0.12;
          mesh.material.emissive.setRGB(nextEm * 0.84, nextEm * 0.64, nextEm * 0.42);
        });
      }

      
      // Phase 3 Assemblage Animation Loop
      if (appState === 'ASSEMBLING') {
        assembleProgress = Math.min(1.0, assembleProgress + delta / assembleDuration);
        const ease = assembleProgress * assembleProgress * (3.0 - 2.0 * assembleProgress); // smoothstep

        // Smooth camera transition to strictly squared frontal view
        if (assembleCamStartPos && assembleCamTargetPos) {
          camera.position.lerpVectors(assembleCamStartPos, assembleCamTargetPos, ease);
          const curLook = new THREE.Vector3().lerpVectors(assembleCamStartLookAt, assembleCamTargetLookAt, ease);
          camera.lookAt(curLook.x, curLook.y, curLook.z);
          camera.up.set(0, 1, 0);
        }

        particleSpeedMultiplier = 1.0 + ease * 3.5;

        // Converge fragments toward target layout on canvas
        if (fragmentMeshes && fragmentTargetLayout) {
          fragmentMeshes.forEach((mesh, idx) => {
            const start = fragmentStartTransforms[idx];
            const target = fragmentTargetLayout[idx];
            if (start && target) {
              mesh.position.lerpVectors(start.pos, target.pos, ease);
              mesh.rotation.x = start.rot.x + (target.rot.x - start.rot.x) * ease;
              mesh.rotation.y = start.rot.y + (target.rot.y - start.rot.y) * ease;
              mesh.rotation.z = start.rot.z + (target.rot.z - start.rot.z) * ease;
              
              const targetScale = target.scale || 1.0;
              const curScale = start.scale + (targetScale - start.scale) * ease;
              mesh.scale.set(curScale, curScale, curScale);

              // Subtly dissolve individual fragments as climax artwork consolidates
              if (assembleProgress > 0.82) {
                const fadeProgress = (assembleProgress - 0.82) / 0.18;
                mesh.material.opacity = Math.max(0.0, 0.92 * (1.0 - fadeProgress));
              }

              // Sound impact triggers
              if (assembleProgress >= (idx * 0.08 + 0.12) && !mesh.userData.impactPlayed) {
                mesh.userData.impactPlayed = true;
                playPaperImpactSound(target.layer || 1);
              }
            }
          });
        }

        // Needle mesh aligns to true north then merges
        if (needleMesh) {
          needleMesh.rotation.z += (0.0 - needleMesh.rotation.z) * 0.08;
          if (assembleProgress > 0.70) {
            needleMesh.scale.multiplyScalar(0.96);
          }
        }

        // Climax Reveal: Bibi Lacoste consolidated portrait emerges
        if (assembleProgress > 0.75) {
          const masterFade = (assembleProgress - 0.75) / 0.25;
          if (solapadoMasterMesh) {
            solapadoMasterMesh.visible = true;
            solapadoMasterMesh.material.opacity = masterFade;
            solapadoMasterMesh.position.set(0, 0.15, -4.10);
            solapadoMasterMesh.rotation.set(0, 0, 0);
          }
          if (solapadoFrameMesh) {
            solapadoFrameMesh.visible = true;
            solapadoFrameMesh.material.opacity = masterFade * 0.85;
            solapadoFrameMesh.position.set(0, 0.15, -4.22);
            solapadoFrameMesh.rotation.set(0, 0, 0);
          }
          if (gallerySpotlight) {
            gallerySpotlight.intensity = masterFade * 2.8;
          }
        }

        // Assemblage Complete Transition to FASE3
        if (assembleProgress >= 1.0) {
          appState = 'FASE3';
          if (cosmosGroup) cosmosGroup.visible = false;
          if (typeof fragmentMeshes !== 'undefined') {
            fragmentMeshes.forEach(m => { 
              m.visible = false; 
              m.material.opacity = 0.0;
            });
          }
          if (needleMesh) needleMesh.visible = false;
          if (solapadoMasterMesh) {
            solapadoMasterMesh.visible = true;
            solapadoMasterMesh.material.opacity = 1.0;
            solapadoMasterMesh.position.set(0, 0.15, -4.10);
            solapadoMasterMesh.rotation.set(0, 0, 0);
          }
          if (solapadoFrameMesh) {
            solapadoFrameMesh.visible = true;
            solapadoFrameMesh.material.opacity = 0.85;
            solapadoFrameMesh.position.set(0, 0.15, -4.22);
            solapadoFrameMesh.rotation.set(0, 0, 0);
          }
          if (gallerySpotlight) gallerySpotlight.intensity = 2.8;

          const targetDist = getAssemblageTargetCameraDistance();
          camera.position.set(0, 0.15, -4.10 + targetDist);
          camera.lookAt(0, 0.15, -4.10);
          camera.up.set(0, 1, 0);

          // Reveal climax card
          const revealCard = document.getElementById('artwork-reveal-card');
          if (revealCard) {
            revealCard.classList.add('visible');
          }

          playHarmonicResolutionChord();
        }
      }
      else if (appState === 'FASE3') {
        if (cosmosGroup) cosmosGroup.visible = false;
        if (typeof fragmentMeshes !== 'undefined') {
          fragmentMeshes.forEach(m => { m.visible = false; });
        }
        const targetDist = getAssemblageTargetCameraDistance();
        camera.position.set(0, 0.15, -4.10 + targetDist);
        camera.lookAt(0, 0.15, -4.10);
        camera.up.set(0, 1, 0);

        // Subtle gallery breathing light & responsive tilt
        const breath = Math.sin(now * 0.0018) * 0.15;
        if (gallerySpotlight) gallerySpotlight.intensity = 2.8 + breath;
        if (solapadoMasterMesh) {
          const tiltY = isTouch ? 0 : mouseNorm.x * 0.04;
          const tiltX = isTouch ? 0 : -mouseNorm.y * 0.03;
          solapadoMasterMesh.rotation.y += (tiltY - solapadoMasterMesh.rotation.y) * 0.05;
          solapadoMasterMesh.rotation.x += (tiltX - solapadoMasterMesh.rotation.x) * 0.05;
          solapadoMasterMesh.rotation.z = 0;
          if (solapadoFrameMesh) {
            solapadoFrameMesh.rotation.y = solapadoMasterMesh.rotation.y;
            solapadoFrameMesh.rotation.x = solapadoMasterMesh.rotation.x;
            solapadoFrameMesh.rotation.z = 0;
          }
        }
      }


      renderer.render(scene, camera);
    }


    function getTopBrandHtml() {
      const t = window.t || ((k, f) => f);
      return '<div class="artist-brand">Bibi Lacoste</div>' +
        '<div class="intro-nav-links" style="pointer-events: auto;">' +
        `<a href="#biografia" onclick="openIntegratedCatalog('biografia'); return false;" class="intro-nav-link" data-i18n="nav.bio">${t('nav.bio', 'Biografía')}</a>` +
        '<span class="intro-nav-sep">&bull;</span>' +
        `<a href="#statement" onclick="openIntegratedCatalog('statement'); return false;" class="intro-nav-link" data-i18n="nav.statement">${t('nav.statement', 'Statement')}</a>` +
        '<span class="intro-nav-sep">&bull;</span>' +
        `<a href="obras.html" class="intro-nav-link"><span class="intro-nav-desktop" data-i18n="nav.catalog">${t('nav.catalog', 'Catálogo de Obras &rarr;')}</span><span class="intro-nav-mobile" data-i18n="nav.catalogShort">${t('nav.catalogShort', 'Obras &rarr;')}</span></a>` +
        '</div>';
    }

    function resetExperienceToPhase1() {
      // Reset state machine
      appState = 'FASE1';
      currentStep = 0;
      cosmosTime = 0.0;
      assembleBtnVisible = false;
      assembleProgress = 0.0;
      particleSpeedMultiplier = 1.0;

      // Unlock status reset
      document.documentElement.classList.remove('catalog-unlocked');
      document.body.classList.remove('catalog-unlocked');

      // Hide all Phase 2 / 3 UI elements
      const revealCard = document.getElementById('artwork-reveal-card');
      if (revealCard) revealCard.classList.remove('visible');

      const assembleBtn = document.getElementById('assemble-btn-container');
      if (assembleBtn) assembleBtn.classList.remove('visible');

      const cosmosNav = document.getElementById('cosmos-nav-bar');
      if (cosmosNav) cosmosNav.classList.remove('visible');

      currentActiveFragmentData = null;
      const quoteCard = document.getElementById('cosmos-quote-card');
      if (quoteCard) quoteCard.classList.remove('visible');
      if (typeof updateCosmosCardContent === 'function') updateCosmosCardContent(null);

      const canvasEl = document.getElementById('webgl-canvas');
      if (canvasEl) canvasEl.classList.remove('cosmos-mode');

      // Reset Phase 1 UI Nodes
      for (let i = 0; i < 4; i++) {
        const node = document.getElementById(`node-${i}`);
        if (node) {
          node.classList.remove('revealed');
          node.style.transform = '';
          node.style.opacity = '';
          node.style.transition = '';
        }
        const dot = document.getElementById(`dot-${i}`);
        if (dot) dot.classList.remove('active');
      }

      // Reset feedback and progress UI
      const feedback = document.getElementById('layer-feedback');
      if (feedback) {
        feedback.style.opacity = '1';
        feedback.style.transform = '';
        feedback.style.transition = '';
        const t = window.t || ((k, f) => f);
        const compassTitle = t('experience.compassTitle', 'FASE 1 • LA BRÚJULA');
        const compassDesc = t('experience.compassDesc', 'Toca el papel para revelar el rumbo');
        feedback.innerHTML = `<span style="color:#D6A46A; letter-spacing:0.24em;">${compassTitle}</span><br>${compassDesc}`;
      }

      const pills = document.querySelector('.progress-pills');
      if (pills) {
        pills.style.opacity = '1';
        pills.style.transition = '';
      }

      const svgThread = document.getElementById('constellation-svg');
      if (svgThread) {
        svgThread.style.opacity = '1';
        svgThread.style.transition = '';
      }

      const thread = document.getElementById('thread-path');
      if (thread) thread.setAttribute('d', '');

      // Reset 3D Meshes
      if (solapadoMasterMesh) {
        solapadoMasterMesh.visible = false;
        solapadoMasterMesh.material.opacity = 0.0;
        solapadoMasterMesh.position.set(0, 0.15, -4.10);
        solapadoMasterMesh.rotation.set(0, 0, 0);
      }
      if (solapadoFrameMesh) {
        solapadoFrameMesh.visible = false;
        solapadoFrameMesh.material.opacity = 0.0;
        solapadoFrameMesh.position.set(0, 0.15, -4.22);
        solapadoFrameMesh.rotation.set(0, 0, 0);
      }
      if (gallerySpotlight) {
        gallerySpotlight.intensity = 0.0;
      }
      if (needleMesh) {
        needleMesh.visible = false;
        needleMesh.scale.set(0.1, 0.1, 0.1);
      }

      // Dispose and clear any stray detached paper leaves
      if (fallingLeaves && fallingLeaves.length > 0) {
        fallingLeaves.forEach(leaf => {
          scene.remove(leaf.mesh);
          if (leaf.mesh.geometry) leaf.mesh.geometry.dispose();
          if (leaf.mesh.material) leaf.mesh.material.dispose();
        });
        fallingLeaves.length = 0;
      }

      // Restore bottom sound bar
      const bottomBar = document.querySelector('.bottom-bar');
      if (bottomBar) bottomBar.style.opacity = '1';

      // Restore burlap compass paper
      if (burlapGroup) {
        burlapGroup.visible = true;
        burlapGroup.scale.set(1.0, 1.0, 1.0);
        burlapGroup.position.set(0, 0.18, 0);
        burlapGroup.rotation.set(basePose.rotX, basePose.rotY, basePose.rotZ);
        burlapMat.opacity = 1.0;
        burlapMat.needsUpdate = true;
        drawBurlapLayer(0);
      }

      // Reset Cosmos Fragments
      if (typeof fragmentMeshes !== 'undefined' && fragmentMeshes.length > 0) {
        fragmentMeshes.forEach((m, idx) => {
          m.visible = true;
          m.material.opacity = 0.0;
          if (cosmosFragmentsData && cosmosFragmentsData[idx]) {
            const d = cosmosFragmentsData[idx];
            m.position.set(d.pos.x, d.pos.y, d.pos.z);
            m.rotation.set(d.rot.x, d.rot.y, d.rot.z);
            m.scale.set(1.0, 1.0, 1.0);
          }
          m.userData.impactPlayed = false;
        });
      }

      // Reset Camera
      const startZ = getResponsiveCameraZ();
      camera.position.set(0, 0, startZ);
      camera.rotation.set(0, 0, 0);
      camera.fov = 35;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);

      // Reset interaction tilts
      targetTilt.x = 0; targetTilt.y = 0;
      freeRotation.x = 0; freeRotation.y = 0;
      currentYaw = 0; targetYaw = 0;
      currentPitch = 0; targetPitch = 0;
      currentZoom = isMobileDevice() ? 3.0 : 1.8;
      targetZoom = currentZoom;

      // Position constellation nodes immediately
      updateConstellation(0, 0, 0, 0);

      // Restore initial top brand navigation
      const brandContainer = document.getElementById('brand-container');
      if (brandContainer) {
        brandContainer.innerHTML = getTopBrandHtml();
      }
    }


    // Immediately position constellation nodes before first frame
    if (typeof updateConstellation === 'function') {
      updateConstellation(0, 0, 0, 0);
    }

    window.addEventListener('languagechange', () => {
      const brandContainer = document.getElementById('brand-container');
      if (brandContainer && typeof getTopBrandHtml === 'function') {
        brandContainer.innerHTML = getTopBrandHtml();
      }

      // Actualizar tarjeta del cosmos en tiempo real según el idioma activo
      if (typeof updateCosmosCardContent === 'function') {
        updateCosmosCardContent(currentActiveFragmentData);
      }
    });

    animate();
