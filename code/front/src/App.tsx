import type { FC } from 'react';
import { Preview } from './components/Preview';
import { ResultView } from './components/ResultView';
import { Steps } from './components/Steps';
import { Uploader } from './components/Uploader';
import { useAppStore } from './store/useAppStore';
import { getStep } from './utils/step';

export const App: FC = () => {
  const step = useAppStore((state) => getStep(state));
  const hasPhotos = useAppStore((state) => state.photos.length > 0);

  return (
    <div className="app">
      <header className="header">
        <h1>Контроль СИЗ</h1>
        <p>Загрузите одно или несколько фото — система найдёт людей без каски или жилета.</p>
      </header>
      <Steps current={step} />
      <main>
        {step === 'upload' && (hasPhotos ? <Preview /> : <Uploader />)}
        {step === 'result' && <ResultView />}
      </main>
    </div>
  );
};
