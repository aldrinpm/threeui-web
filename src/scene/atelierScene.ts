import * as THREE from "three";

/** Every scroll chapter of the page owns one camera. */
export type ChapterId =
  | "hero"
  | "cutting"
  | "rail"
  | "collection"
  | "fitting"
  | "footer";

type View = {
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
};

const CHAPTERS: Record<ChapterId, View> = {
  hero: { pos: [0.7, 2.35, 10.4], look: [0, 1.95, 0], fov: 34 },
  cutting: { pos: [-4.4, 1.75, 4.6], look: [-2.7, 1.05, -1.6], fov: 32 },
  rail: { pos: [5.4, 2.5, 5.6], look: [0.3, 1.9, -0.5], fov: 34 },
  collection: { pos: [0, 3.5, 7.4], look: [0, 1.6, -1.6], fov: 38 },
  fitting: { pos: [0.4, 1.6, 4.6], look: [3.1, 1.1, 1.5], fov: 30 },
  footer: { pos: [0, 5.2, 12.4], look: [0, 1.5, -1.4], fov: 40 },
};

/** Live viewports punched into the page: three product cards plus the hero preview. */
const CARD_VIEWS: View[] = [
  { pos: [0, 1.95, 5.4], look: [0, 1.92, 0], fov: 24 },
  { pos: [-3.16, 1.95, 5.4], look: [-3.16, 1.92, 0], fov: 24 },
  { pos: [1.58, 1.8, 5.2], look: [1.58, 1.68, 0], fov: 24 },
  { pos: [0, 2.0, 5.6], look: [0, 1.95, 0], fov: 22 },
];

const GARMENT_SWATCHES: Swatch[] = [
  { color: 0x4a453f, sheen: 0x8a7f72, shape: "coat" }, // charcoal wool overcoat
  { color: 0xcfc4b0, sheen: 0xfff6e6, shape: "shirt" }, // bone linen overshirt
  { color: 0x5e2823, sheen: 0xc98a7a, shape: "coat" }, // oxblood trench
  { color: 0x27304a, sheen: 0x8fa5c9, shape: "trouser" }, // indigo selvedge
  { color: 0xa8967a, sheen: 0xefe0c2, shape: "knit" }, // sand merino crew
];

interface FrameTarget {
  el: HTMLElement;
  camera: THREE.PerspectiveCamera;
  view: View;
  /** The hero preview drifts, the way a turntable would. */
  drift: boolean;
}

export interface AtelierSceneOptions {
  canvas: HTMLCanvasElement;
  /** Reported 0..1 while the atelier is built. */
  onProgress?: (value: number) => void;
  /** Called once the first frame has been drawn. */
  onReady?: () => void;
}

export class AtelierScene {
  private readonly canvas: HTMLCanvasElement;
  private readonly onProgress?: (value: number) => void;
  private readonly onReady?: () => void;

  private renderer!: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera!: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();
  private raf = 0;
  private disposed = false;
  private readyFired = false;

  private chapter: ChapterId = "hero";
  private readonly camPos = new THREE.Vector3(...CHAPTERS.hero.pos);
  private readonly camLook = new THREE.Vector3(...CHAPTERS.hero.look);
  private readonly targetPos = new THREE.Vector3(...CHAPTERS.hero.pos);
  private readonly targetLook = new THREE.Vector3(...CHAPTERS.hero.look);
  private targetFov = CHAPTERS.hero.fov;
  private readonly pointer = new THREE.Vector2();
  private readonly pointerSmooth = new THREE.Vector2();

  private frames: FrameTarget[] = [];
  private readonly timeUniform = { value: 0 };
  private readonly clothGroup = new THREE.Group();
  private readonly pedestal = new THREE.Group();
  private motes!: THREE.Points;
  private readonly reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  constructor(options: AtelierSceneOptions) {
    this.canvas = options.canvas;
    this.onProgress = options.onProgress;
    this.onReady = options.onReady;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;

    this.scene.background = new THREE.Color(0x0c0b0a);
    this.scene.fog = new THREE.Fog(0x0c0b0a, 9, 27);

    this.camera = new THREE.PerspectiveCamera(
      CHAPTERS.hero.fov,
      window.innerWidth / window.innerHeight,
      0.1,
      120,
    );
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);

    this.onProgress?.(0.18);
    this.buildLights();
    this.buildFloor();
    this.buildRail();
    this.buildPedestal();
    this.buildTable();
    this.buildMotes();
    this.onProgress?.(0.52);

    this.collectFrames();
    this.bindEvents();
    this.onProgress?.(0.68);

    this.loop();
  }

  /* ----------------------------------------------------------------- scene */

  private buildLights(): void {
    this.scene.add(new THREE.HemisphereLight(0x241f1b, 0x090807, 0.42));

    const key = new THREE.DirectionalLight(0xffe2be, 1.15);
    key.position.set(4.5, 7.5, 5.5);
    this.scene.add(key);

    const rim = new THREE.DirectionalLight(0x7e93b4, 0.85);
    rim.position.set(-6, 4.2, -4.5);
    this.scene.add(rim);

    const practical = new THREE.PointLight(0xffb877, 14, 12, 2);
    practical.position.set(3.3, 2.1, 1.6);
    this.scene.add(practical);

    const spot = new THREE.SpotLight(0xfff2df, 95, 30, 0.46, 0.85, 1.7);
    spot.position.set(-0.6, 7.6, 3.2);
    spot.target.position.set(0, 1.2, 0);
    this.scene.add(spot, spot.target);
  }

  private buildFloor(): void {
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshStandardMaterial({
        color: 0x151311,
        roughness: 0.92,
        metalness: 0.04,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    this.scene.add(floor);
  }

  /** The rail: a chrome bar, five garments, five hangers. */
  private buildRail(): void {
    const metal = new THREE.MeshStandardMaterial({
      color: 0xa8a49c,
      roughness: 0.34,
      metalness: 0.92,
    });

    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 8.1, 20), metal);
    bar.rotation.z = Math.PI / 2;
    bar.position.set(0, 3.16, 0);
    this.scene.add(bar);

    for (const x of [-4.0, 4.0]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3.16, 18), metal);
      post.position.set(x, 1.58, 0);
      this.scene.add(post);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.07, 24), metal);
      foot.position.set(x, 0.035, 0);
      this.scene.add(foot);
    }

    const spacing = 1.58;
    const start = -((GARMENT_SWATCHES.length - 1) * spacing) / 2;
    GARMENT_SWATCHES.forEach((swatch, index) => {
      const x = start + index * spacing;
      const phase = index * 1.7;

      const geometry = new THREE.PlaneGeometry(1.34, 2.1, 20, 26);
      const material = new THREE.MeshPhysicalMaterial({
        map: makeGarmentTexture(swatch),
        color: 0xffffff,
        roughness: 0.95,
        metalness: 0,
        sheen: 1,
        sheenRoughness: 0.7,
        sheenColor: swatch.sheen,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.28,
        alphaToCoverage: true,
      });
      attachClothWave(material, this.timeUniform, phase);

      const garment = new THREE.Mesh(geometry, material);
      garment.position.set(x, 1.98, 0);
      garment.rotation.y = (index % 2 === 0 ? 1 : -1) * 0.08;
      this.clothGroup.add(garment);

      const hanger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.011, 0.44, 10),
        metal,
      );
      hanger.rotation.z = Math.PI / 2;
      hanger.position.set(x, 3.03, 0);
      this.clothGroup.add(hanger);

      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 8, 20, Math.PI * 1.4), metal);
      hook.position.set(x, 3.12, 0);
      hook.rotation.y = Math.PI / 2;
      this.clothGroup.add(hook);
    });

    this.scene.add(this.clothGroup);
  }

  /** The pedestal: folded pieces, lit by a practical light. */
  private buildPedestal(): void {
    const stone = new THREE.MeshStandardMaterial({
      color: 0x1c1a18,
      roughness: 0.85,
      metalness: 0.05,
    });
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.9, 40), stone);
    column.position.set(3.3, 0.45, 1.6);
    this.pedestal.add(column);

    const stack = [0xcfc4b0, 0xa8967a, 0x4a453f, 0x5e2823];
    stack.forEach((color, index) => {
      const folded = new THREE.Mesh(
        new THREE.BoxGeometry(0.92, 0.11, 0.7, 6, 1, 5),
        new THREE.MeshPhysicalMaterial({
          color,
          roughness: 0.95,
          sheen: 0.8,
          sheenColor: 0xffffff,
          sheenRoughness: 0.8,
        }),
      );
      folded.position.set(
        3.3 + (index % 2 ? 0.04 : -0.04),
        0.97 + index * 0.115,
        1.6 + (index % 2 ? -0.03 : 0.04),
      );
      folded.rotation.y = (index - 1.5) * 0.11;
      this.pedestal.add(folded);

      const fold = new THREE.Mesh(
        new THREE.BoxGeometry(0.86, 0.012, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x1a1714, roughness: 1 }),
      );
      fold.position.set(
        3.3 + (index % 2 ? 0.04 : -0.04),
        1.03 + index * 0.115,
        1.6 + (index % 2 ? -0.03 : 0.04) - 0.16,
      );
      fold.rotation.y = (index - 1.5) * 0.11;
      this.pedestal.add(fold);
    });

    this.scene.add(this.pedestal);
  }

  /** The cutting table: a top on legs, a swatch, a spool and a paper pattern. */
  private buildTable(): void {
    const wood = new THREE.MeshStandardMaterial({
      color: 0x2a241d,
      roughness: 0.78,
      metalness: 0.06,
    });
    const table = new THREE.Group();
    table.position.set(-3.25, 0, -1.7);
    table.rotation.y = 0.18;

    const top = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.07, 1.25), wood);
    top.position.y = 0.9;
    table.add(top);

    for (const [dx, dz] of [
      [-1.15, -0.52],
      [1.15, -0.52],
      [-1.15, 0.52],
      [1.15, 0.52],
    ]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.87, 0.07), wood);
      leg.position.set(dx, 0.435, dz);
      table.add(leg);
    }

    const swatch = new THREE.Mesh(
      new THREE.BoxGeometry(0.86, 0.05, 0.62, 6, 1, 4),
      new THREE.MeshPhysicalMaterial({
        color: 0x8a5a45,
        roughness: 0.92,
        sheen: 0.7,
        sheenColor: 0xd8b48c,
      }),
    );
    swatch.position.set(-0.42, 0.96, 0.06);
    swatch.rotation.y = 0.12;
    table.add(swatch);

    const pattern = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 0.008, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x8f8878, roughness: 0.95 }),
    );
    pattern.position.set(0.52, 0.94, -0.1);
    pattern.rotation.y = -0.22;
    table.add(pattern);

    const spool = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.16, 20),
      new THREE.MeshStandardMaterial({ color: 0x6f6455, roughness: 0.7, metalness: 0.3 }),
    );
    spool.position.set(0.16, 1.02, 0.3);
    table.add(spool);

    this.scene.add(table);
  }

  private buildMotes(): void {
    const count = 520;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * 5.4 + 0.1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.motes = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color: 0xffe3bd,
        size: 0.032,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    );
    this.scene.add(this.motes);
  }

  /* --------------------------------------------------------------- frames */

  private collectFrames(): void {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-frame]"),
    );
    this.frames = elements
      .map((el) => {
        const index = Number(el.dataset.view ?? "0");
        const view = CARD_VIEWS[index] ?? CARD_VIEWS[0];
        const camera = new THREE.PerspectiveCamera(view.fov, 1, 0.1, 80);
        camera.position.set(...view.pos);
        camera.lookAt(view.look[0], view.look[1], view.look[2]);
        return { el, camera, view, drift: index === CARD_VIEWS.length - 1 };
      })
      .sort((a, b) => a.view.pos[2] - b.view.pos[2]);
  }

  /* --------------------------------------------------------------- events */

  private readonly onResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  };

  private readonly onPointer = (event: PointerEvent) => {
    this.pointer.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      (event.clientY / window.innerHeight) * 2 - 1,
    );
  };

  private readonly onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    } else if (!this.raf && !this.disposed) {
      this.clock.getDelta();
      this.loop();
    }
  };

  private bindEvents(): void {
    window.addEventListener("resize", this.onResize);
    window.addEventListener("pointermove", this.onPointer, { passive: true });
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  /* ---------------------------------------------------------------- frame */

  setChapter(chapter: ChapterId): void {
    if (this.chapter === chapter) return;
    this.chapter = chapter;
    const view = CHAPTERS[chapter];
    this.targetPos.set(...view.pos);
    this.targetLook.set(...view.look);
    this.targetFov = view.fov;
  }

  private loop = () => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.loop);

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const elapsed = this.clock.elapsedTime;
    this.timeUniform.value = elapsed;

    const damping = 1 - Math.pow(0.0016, delta);
    this.camPos.lerp(this.targetPos, damping);
    this.camLook.lerp(this.targetLook, damping);
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
    if (Math.abs(this.camera.fov - this.targetFov) > 0.01) {
      this.camera.fov += (this.targetFov - this.camera.fov) * damping;
      this.camera.updateProjectionMatrix();
    }

    if (!this.reduced) {
      this.pointerSmooth.lerp(this.pointer, 1 - Math.pow(0.02, delta));
      this.camera.position.x += this.pointerSmooth.x * 0.22;
      this.camera.position.y += -this.pointerSmooth.y * 0.12;
      this.clothGroup.rotation.y = Math.sin(elapsed * 0.18) * 0.02;
      this.pedestal.rotation.y = elapsed * 0.12;
      this.motes.rotation.y = elapsed * 0.015;
      this.motes.position.y = Math.sin(elapsed * 0.25) * 0.12;
    }

    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);

    this.renderFrames();

    if (!this.readyFired) {
      this.readyFired = true;
      this.onProgress?.(1);
      this.onReady?.();
    }
  };

  /** Each live window is a scissored viewport onto the same atelier. */
  private renderFrames(): void {
    if (this.frames.length === 0) return;
    const height = window.innerHeight;

    for (const frame of this.frames) {
      const rect = frame.el.getBoundingClientRect();
      if (rect.bottom < -40 || rect.top > height + 40 || rect.width < 4) continue;
      if (effectiveOpacity(frame.el) < 0.99) continue;

      frame.camera.aspect = rect.width / rect.height;
      frame.camera.updateProjectionMatrix();

      if (frame.drift) {
        const swing = Math.sin(this.clock.elapsedTime * 0.28) * 0.34;
        frame.camera.position.set(
          frame.view.pos[0] + swing,
          frame.view.pos[1] + Math.sin(this.clock.elapsedTime * 0.19) * 0.08,
          frame.view.pos[2],
        );
        frame.camera.lookAt(frame.view.look[0], frame.view.look[1], frame.view.look[2]);
      }

      this.renderer.setViewport(rect.left, height - rect.bottom, rect.width, rect.height);
      this.renderer.setScissor(rect.left, height - rect.bottom, rect.width, rect.height);
      this.renderer.setScissorTest(true);
      this.renderer.render(this.scene, frame.camera);
    }

    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
  }

  dispose(): void {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("pointermove", this.onPointer);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      mesh.geometry?.dispose?.();
      const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material?.dispose?.();
    });
    this.renderer.dispose();
  }
}

/* ------------------------------------------------------------- geometry */

type GarmentShape = "coat" | "shirt" | "knit" | "trouser";

type Swatch = {
  color: number;
  sheen: number;
  shape: GarmentShape;
};

/**
 * Paints a garment: silhouette, fold shading and weave, on a transparent
 * canvas. The plane in the scene is what moves; this is what it wears.
 */
function makeGarmentTexture(swatch: Swatch): THREE.CanvasTexture {
  const width = 512;
  const height = 800;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const base = new THREE.Color(swatch.color);
  const baseCss = `#${base.getHexString()}`;

  const spec = {
    coat: { length: 640, bodyHalf: 132, hemHalf: 172, shoulderHalf: 156, sleeve: 0.44, neckHalf: 54 },
    shirt: { length: 540, bodyHalf: 122, hemHalf: 134, shoulderHalf: 146, sleeve: 0.28, neckHalf: 50 },
    knit: { length: 500, bodyHalf: 134, hemHalf: 140, shoulderHalf: 152, sleeve: 0.66, neckHalf: 58 },
    trouser: { length: 640, bodyHalf: 96, hemHalf: 96, shoulderHalf: 0, sleeve: 0, neckHalf: 0 },
  }[swatch.shape];

  const cx = width / 2;
  const top = 80;
  const bottom = top + spec.length;
  const cuffY = top + spec.length * spec.sleeve;
  const armpitY = top + spec.length * spec.sleeve * 0.6;
  const shoulderDrop = 22;

  ctx.clearRect(0, 0, width, height);
  ctx.beginPath();

  if (swatch.shape === "trouser") {
    const waist = top + 20;
    const hip = top + 190;
    const hem = bottom - 30;
    ctx.moveTo(cx - 74, waist);
    ctx.quadraticCurveTo(cx - 96, hip - 60, cx - 92, hip);
    ctx.quadraticCurveTo(cx - 90, hem - 60, cx - 84, hem);
    ctx.lineTo(cx - 12, hem);
    ctx.quadraticCurveTo(cx - 6, hem - 80, cx - 4, waist + 300);
    ctx.quadraticCurveTo(cx, waist + 250, cx + 4, waist + 300);
    ctx.quadraticCurveTo(cx + 6, hem - 80, cx + 12, hem);
    ctx.lineTo(cx + 84, hem);
    ctx.quadraticCurveTo(cx + 90, hem - 60, cx + 92, hip);
    ctx.quadraticCurveTo(cx + 96, hip - 60, cx + 74, waist);
    ctx.quadraticCurveTo(cx, waist - 16, cx - 74, waist);
  } else {
    ctx.moveTo(cx - spec.neckHalf, top);
    ctx.quadraticCurveTo(
      cx - spec.shoulderHalf * 0.7,
      top - 4,
      cx - spec.shoulderHalf,
      top + shoulderDrop,
    );
    ctx.quadraticCurveTo(
      cx - spec.shoulderHalf - 16,
      cuffY - 40,
      cx - spec.shoulderHalf - 20,
      cuffY,
    );
    ctx.lineTo(cx - spec.bodyHalf - 18, cuffY - 10);
    ctx.quadraticCurveTo(cx - spec.bodyHalf - 6, armpitY + 20, cx - spec.bodyHalf, armpitY);
    ctx.quadraticCurveTo(
      cx - spec.bodyHalf - 6,
      bottom - 90,
      cx - spec.hemHalf,
      bottom - 6,
    );
    ctx.quadraticCurveTo(cx, bottom + 18, cx + spec.hemHalf, bottom - 6);
    ctx.quadraticCurveTo(
      cx + spec.bodyHalf + 6,
      bottom - 90,
      cx + spec.bodyHalf,
      armpitY,
    );
    ctx.quadraticCurveTo(cx + spec.bodyHalf + 6, armpitY + 20, cx + spec.bodyHalf + 18, cuffY - 10);
    ctx.lineTo(cx + spec.shoulderHalf + 20, cuffY);
    ctx.quadraticCurveTo(
      cx + spec.shoulderHalf + 16,
      cuffY - 40,
      cx + spec.shoulderHalf,
      top + shoulderDrop,
    );
    ctx.quadraticCurveTo(
      cx + spec.shoulderHalf * 0.7,
      top - 4,
      cx + spec.neckHalf,
      top,
    );
    ctx.quadraticCurveTo(cx, top + 34, cx - spec.neckHalf, top);
  }
  ctx.closePath();

  ctx.save();
  ctx.clip();
  ctx.fillStyle = baseCss;
  ctx.fillRect(0, 0, width, height);

  const half = swatch.shape === "trouser" ? 100 : spec.hemHalf;
  // the body of the cloth is a cylinder, not a flat board
  const across = ctx.createLinearGradient(cx - half, 0, cx + half, 0);
  across.addColorStop(0, "rgba(0,0,0,.42)");
  across.addColorStop(0.24, "rgba(0,0,0,.10)");
  across.addColorStop(0.46, "rgba(255,255,255,.10)");
  across.addColorStop(0.7, "rgba(0,0,0,.12)");
  across.addColorStop(1, "rgba(0,0,0,.44)");
  ctx.fillStyle = across;
  ctx.fillRect(0, 0, width, height);

  // light falls from above: the shoulders catch it, the hem loses it
  const down = ctx.createLinearGradient(0, top, 0, bottom);
  down.addColorStop(0, "rgba(255,255,255,.12)");
  down.addColorStop(0.45, "rgba(0,0,0,0)");
  down.addColorStop(1, "rgba(0,0,0,.4)");
  ctx.fillStyle = down;
  ctx.fillRect(0, 0, width, height);

  // folds
  ctx.lineCap = "round";
  for (let i = 0; i < 9; i++) {
    const x = cx + (i - 4) * 34 + Math.sin(i * 2.3) * 12;
    const drift = Math.sin(i * 1.7) * 18;
    ctx.beginPath();
    ctx.moveTo(x, top + 30);
    ctx.quadraticCurveTo(x + drift, (top + bottom) / 2, x + drift * 0.4, bottom - 20);
    ctx.strokeStyle = i % 2 === 0 ? "rgba(0,0,0,.16)" : "rgba(255,255,255,.07)";
    ctx.lineWidth = i % 2 === 0 ? 7 : 4;
    ctx.stroke();
  }

  // ribbing on a knit, a waistband on a trouser
  if (swatch.shape === "knit") {
    ctx.globalAlpha = 0.22;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let x = cx - spec.hemHalf; x < cx + spec.hemHalf; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, bottom - 40);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  if (swatch.shape === "trouser") {
    ctx.fillStyle = "rgba(0,0,0,.3)";
    ctx.fillRect(cx - 80, top + 12, 160, 16);
    ctx.fillStyle = "rgba(255,255,255,.05)";
    ctx.fillRect(cx - 80, top + 28, 160, 3);
  }

  // weave
  ctx.globalAlpha = 0.06;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  for (let y = top; y < bottom; y += 3) {
    ctx.beginPath();
    ctx.moveTo(cx - half, y);
    ctx.lineTo(cx + half, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // neck shadow and a stitched edge
  if (swatch.shape !== "trouser") {
    ctx.beginPath();
    ctx.ellipse(cx, top + 4, spec.neckHalf * 0.92, 22, 0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,.55)";
    ctx.fill();

    ctx.strokeStyle = "rgba(0,0,0,.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** A slow sway in the vertex stage, so the cloth moves like hanging fabric. */
function attachClothWave(
  material: THREE.Material,
  time: { value: number },
  phase: number,
): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.uniforms.uPhase = { value: phase };
    shader.vertexShader =
      "uniform float uTime;\nuniform float uPhase;\n" + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float drape = 1.0 - uv.y;
       float bulge = cos(clamp(uv.x, 0.0, 1.0) * 3.14159265);
       transformed.z += bulge * 0.085 * (0.45 + 0.55 * drape);
       transformed.z += sin(position.y * 2.6 + uTime * 0.85 + uPhase) * 0.055 * drape;
       transformed.x += sin(position.y * 1.7 + uTime * 0.6 + uPhase) * 0.02 * drape;`,
    );
  };
  material.customProgramCacheKey = () => "atelier-cloth";
}

/** A frame is only worth drawing when the page still shows it. */
function effectiveOpacity(element: HTMLElement): number {
  let alpha = 1;
  for (let node: HTMLElement | null = element; node && node !== document.body; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") return 0;
    alpha *= Number(style.opacity);
    if (alpha < 0.001) return 0;
  }
  return alpha;
}
