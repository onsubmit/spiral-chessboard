import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

import { CanvasModel } from '../../CanvasModel';
import { Drawable } from '../../Drawables/Drawable';
import { Drawer } from '../../Drawer';
import { Canvas } from '../Canvas';
import styles from './Scene.module.css';

export type SceneLayer = {
  canvasModel: CanvasModel | null;
  drawables: Array<Drawable>;
};

export type SceneProps = {
  background: SceneLayer | undefined;
};

export type SceneCanvases = {
  background: HTMLCanvasElement | null;
};

const Scene = forwardRef<SceneCanvases, SceneProps>(function Scene(
  { background }: SceneProps,
  ref: React.ForwardedRef<SceneCanvases>,
) {
  const backgroundRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!background?.canvasModel) {
      return;
    }

    const backgroundDrawer = new Drawer(background.canvasModel);

    backgroundDrawer.clear();
    background.drawables.forEach((d) => backgroundDrawer.draw(d));
  }, [background]);

  useImperativeHandle(ref, (): SceneCanvases => {
    return {
      background: backgroundRef.current,
    };
  }, []);

  return (
    <Canvas
      ref={backgroundRef}
      className={styles.canvas}
      width={background?.canvasModel?.canvasDimensions.width ?? 0}
      height={background?.canvasModel?.canvasDimensions.height ?? 0}
    />
  );
});

export { Scene };
