import { useCallback, type FC } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { DrawFn } from '../types';
import { drawPeople } from '../utils/draw';
import { ImageCanvas } from './ImageCanvas';
import { PeopleList } from './PeopleList';
import { Verdict } from './Verdict';

export const ResultView: FC = () => {
  const image = useAppStore((state) => state.image);
  const result = useAppStore((state) => state.result);
  const reset = useAppStore((state) => state.reset);

  const draw = useCallback<DrawFn>(
    (ctx, scale) => {
      if (result) drawPeople(ctx, result.people, scale);
    },
    [result],
  );

  function handleNewPhotoClick(): void {
    reset();
  }

  if (!image || !result) return null;

  return (
    <section className="card">
      <Verdict
        violation={result.violation}
        violators={result.people.filter((person) => person.violation).length}
        people={result.people.length}
      />
      <ImageCanvas image={image} draw={draw} />
      <PeopleList people={result.people} />
      <div className="actions">
        <button type="button" className="button button--primary" onClick={handleNewPhotoClick}>
          Новое фото
        </button>
      </div>
    </section>
  );
};
