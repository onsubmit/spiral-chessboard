import styles from './App.module.css';
import MainScene from './components/Scenes/MainScene';

function App(): React.JSX.Element {
  return (
    <div className={styles.app}>
      <MainScene />
    </div>
  );
}

export default App;
