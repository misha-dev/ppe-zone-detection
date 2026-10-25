import type { FC } from 'react';
import { PHOTO_STATUS_LABELS } from '../constants';
import type { PhotoGalleryProps } from '../types';
import { getPhotoStatus } from '../utils/photo';

export const PhotoGallery: FC<PhotoGalleryProps> = ({ photos, selectedId, disabled, onSelect, onRemove }) => (
  <ul className="gallery">
    {photos.map((photo) => {
      const status = getPhotoStatus(photo);
      return (
        <li
          key={photo.id}
          className={`gallery__item gallery__item--${status}${photo.id === selectedId ? ' gallery__item--selected' : ''}`}
        >
          <button
            type="button"
            className="gallery__thumb"
            onClick={() => onSelect?.(photo.id)}
            disabled={!onSelect}
            title={photo.file.name}
          >
            <img src={photo.image.src} alt={photo.file.name} />
            {status !== 'pending' && (
              <span className={`badge badge--${status} gallery__badge`}>{PHOTO_STATUS_LABELS[status]}</span>
            )}
          </button>
          {onRemove && (
            <button
              type="button"
              className="gallery__remove"
              onClick={() => onRemove(photo.id)}
              disabled={disabled}
              aria-label={`Удалить ${photo.file.name}`}
            >
              ×
            </button>
          )}
        </li>
      );
    })}
  </ul>
);
