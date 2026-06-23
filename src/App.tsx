import { useState } from 'react';

import styles from './App.module.css';
import MainScene from './components/Scenes/MainScene';

function App(): React.JSX.Element {
  const [canvasScale, setCanvasScale] = useState(2);
  const [size, setSize] = useState(100);

  return (
    <div className={styles.app}>
      <div style={{ display: 'flex', gap: 16, padding: '8px 16px', alignItems: 'center' }}>
        <label style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
          Scale:
          <input
            type="number"
            value={canvasScale}
            min={1}
            onChange={(e) => setCanvasScale(Number(e.target.value))}
            style={{ marginLeft: 8, width: 64 }}
          />
        </label>
        <label style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
          Size:
          <input
            type="number"
            value={size}
            min={25}
            step={25}
            onChange={(e) => setSize(Number(e.target.value))}
            style={{ marginLeft: 8, width: 64 }}
          />
        </label>
      </div>
      <MainScene canvasScale={canvasScale} size={size} />
    </div>
  );
}

export default App;
