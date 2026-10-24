import type { FC } from 'react';
import { STEPS } from '../constants';
import type { StepsProps } from '../types';

export const Steps: FC<StepsProps> = ({ current }) => {
  const currentIndex = STEPS.findIndex((step) => step.id === current);

  return (
    <ol className="steps">
      {STEPS.map((step, index) => (
        <li
          key={step.id}
          className={`steps__item${index === currentIndex ? ' steps__item--active' : ''}${index < currentIndex ? ' steps__item--done' : ''}`}
        >
          <span className="steps__number">{index + 1}</span>
          {step.label}
        </li>
      ))}
    </ol>
  );
};
