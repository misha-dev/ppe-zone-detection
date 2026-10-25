import { useCallback, type FC } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { DrawFn } from '../types';
import { drawPeople } from '../utils/draw';
import { ImageCanvas } from './ImageCanvas';
import { PeopleList } from './PeopleList';
import { PhotoGallery } from './PhotoGallery';
import { Summary } from './Summary';
import { Verdict } from './Verdict';

export const ResultView: FC = () => {
  const photos = useAppStore((state) => state.photos);
  const selectedId = useAppStore((state) => state.selectedId);
  const selectPhoto = useAppStore((state) => state.selectPhoto);
  const reset = useAppStore((state) => state.reset);
  const photo = photos.find((item) => item.id === selectedId) ?? photos[0];
  const result = photo?.result;

  const draw = useCallback<DrawFn>(
    (ctx, scale) => {
      if (result) drawPeople(ctx, result.people, scale);
    },
    [result],
  );

  function handleSelect(id: string): void {
    selectPhoto(id);
  }

  function handleNewPhotoClick(): void {
    reset();
  }

  if (!photo) return null;

  return (
    <section className="card">
      {photos.length > 1 && (
        <>
          <Summary photos={photos} />
          <PhotoGallery photos={photos} selectedId={photo.id} onSelect={handleSelect} />
          <h2 className="card__title">{photo.file.name}</h2>
        </>
      )}
      {result && (
        <Verdict
          violation={result.violation}
          violators={result.people.filter((person) => person.violation).length}
          people={result.people.length}
        />
      )}
      {photo.error && <p className="error">{photo.error}</p>}
      <ImageCanvas image={photo.image} draw={draw} />
      {result && <PeopleList people={result.people} />}
      <div className="actions">
        <button type="button" className="button button--primary" onClick={handleNewPhotoClick}>
          {photos.length > 1 ? 'Новые фото' : 'Новое фото'}
        </button>
      </div>
    </section>
  );
};
