import type { FC } from 'react';
import type { SummaryProps } from '../types';
import { getPhotoStatus } from '../utils/photo';

export const Summary: FC<SummaryProps> = ({ photos }) => {
  const statuses = photos.map(getPhotoStatus);
  const violations = statuses.filter((status) => status === 'violation').length;
  const errors = statuses.filter((status) => status === 'error').length;

  return (
    <div className={`verdict ${violations ? 'verdict--bad' : 'verdict--good'}`}>
      <strong>{violations ? `Нарушения на ${violations} из ${photos.length} фото` : 'Нарушений нет'}</strong>
      <span>
        Проверено фото: {photos.length - errors}
        {errors > 0 && `. С ошибкой: ${errors}`}.
      </span>
    </div>
  );
};
