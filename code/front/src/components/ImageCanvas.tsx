import { useEffect, useRef, type FC } from 'react';
import { useElementWidth } from '../hooks/useElementWidth';
import type { ImageCanvasProps } from '../types';

export const ImageCanvas: FC<ImageCanvasProps> = ({ image, draw }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const width = useElementWidth(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    ctx.drawImage(image, 0, 0);
    draw?.(ctx, width ? image.naturalWidth / width : 1);
  }, [image, draw, width]);

  return (
    <div className="canvas-wrap">
      <canvas ref={canvasRef} className="canvas" />
    </div>
  );
};
