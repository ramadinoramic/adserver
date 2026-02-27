// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricCanvas = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FabricObject = any;

interface GuideLine {
  orientation: 'horizontal' | 'vertical';
  position: number;
}

const SNAP_THRESHOLD = 8;

export function setupSmartGuides(canvas: FabricCanvas): () => void {
  let activeGuides: GuideLine[] = [];

  function getCanvasCenter() {
    return {
      x: canvas.getWidth() / 2,
      y: canvas.getHeight() / 2,
    };
  }

  function getOtherObjectsBounds(activeObj: FabricObject) {
    const bounds: { x: number; y: number; w: number; h: number }[] = [];
    canvas.getObjects().forEach((obj: FabricObject) => {
      if (obj === activeObj || !obj.visible) return;
      const bound = obj.getBoundingRect(true);
      bounds.push({ x: bound.left, y: bound.top, w: bound.width, h: bound.height });
    });
    return bounds;
  }

  function snapObject(obj: FabricObject): GuideLine[] {
    const bound = obj.getBoundingRect(true);
    const center = getCanvasCenter();
    const guides: GuideLine[] = [];

    const objLeft = bound.left;
    const objRight = bound.left + bound.width;
    const objTop = bound.top;
    const objBottom = bound.top + bound.height;
    const objCenterX = bound.left + bound.width / 2;
    const objCenterY = bound.top + bound.height / 2;

    const edgeSnaps = [
      { val: objLeft, guide: 0, axis: 'x' },
      { val: objRight, guide: canvas.getWidth(), axis: 'x' },
      { val: objCenterX, guide: center.x, axis: 'x' },
      { val: objTop, guide: 0, axis: 'y' },
      { val: objBottom, guide: canvas.getHeight(), axis: 'y' },
      { val: objCenterY, guide: center.y, axis: 'y' },
    ];

    edgeSnaps.forEach(({ val, guide, axis }) => {
      if (Math.abs(val - guide) < SNAP_THRESHOLD) {
        guides.push({
          orientation: axis === 'x' ? 'vertical' : 'horizontal',
          position: guide,
        });
        if (axis === 'x') {
          obj.set('left', (obj.left ?? 0) + (guide - val));
        } else {
          obj.set('top', (obj.top ?? 0) + (guide - val));
        }
      }
    });

    const otherBounds = getOtherObjectsBounds(obj);
    otherBounds.forEach((other) => {
      const snapToPoints = [
        { val: objLeft, guide: other.x, orientation: 'vertical' as const },
        { val: objRight, guide: other.x + other.w, orientation: 'vertical' as const },
        { val: objCenterX, guide: other.x + other.w / 2, orientation: 'vertical' as const },
        { val: objTop, guide: other.y, orientation: 'horizontal' as const },
        { val: objBottom, guide: other.y + other.h, orientation: 'horizontal' as const },
        { val: objCenterY, guide: other.y + other.h / 2, orientation: 'horizontal' as const },
      ];

      snapToPoints.forEach(({ val, guide, orientation }) => {
        if (Math.abs(val - guide) < SNAP_THRESHOLD) {
          guides.push({ orientation, position: guide });
          if (orientation === 'vertical') {
            obj.set('left', (obj.left ?? 0) + (guide - val));
          } else {
            obj.set('top', (obj.top ?? 0) + (guide - val));
          }
        }
      });
    });

    return guides;
  }

  function drawGuides(guides: GuideLine[]) {
    activeGuides = guides;
    canvas.renderAll();
  }

  function clearGuides() {
    activeGuides = [];
    canvas.renderAll();
  }

  canvas.on('after:render', () => {
    if (activeGuides.length === 0) return;
    const ctx = canvas.getContext();
    ctx.save();
    ctx.strokeStyle = '#e94560';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    activeGuides.forEach((guide) => {
      ctx.beginPath();
      if (guide.orientation === 'vertical') {
        ctx.moveTo(guide.position, 0);
        ctx.lineTo(guide.position, canvas.getHeight());
      } else {
        ctx.moveTo(0, guide.position);
        ctx.lineTo(canvas.getWidth(), guide.position);
      }
      ctx.stroke();
    });

    ctx.restore();
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onMoving = (e: any) => {
    if (!e.target) return;
    drawGuides(snapObject(e.target));
  };

  const onModified = () => clearGuides();

  canvas.on('object:moving', onMoving);
  canvas.on('object:modified', onModified);
  canvas.on('mouse:up', onModified);

  return () => {
    canvas.off('object:moving', onMoving);
    canvas.off('object:modified', onModified);
    canvas.off('mouse:up', onModified);
  };
}
