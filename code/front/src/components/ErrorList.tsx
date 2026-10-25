import type { FC } from 'react';
import type { ErrorListProps } from '../types';

export const ErrorList: FC<ErrorListProps> = ({ errors }) =>
  errors.length > 0 && (
    <div className="error">
      {errors.map((error, index) => (
        <p key={index}>{error}</p>
      ))}
    </div>
  );
