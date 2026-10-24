import type { FC } from 'react';
import type { VerdictProps } from '../types';

export const Verdict: FC<VerdictProps> = ({ violation, violators, people }) => (
  <div className={`verdict ${violation ? 'verdict--bad' : 'verdict--good'}`}>
    <strong>{violation ? 'Есть нарушение' : 'Нарушений нет'}</strong>
    <span>
      Людей найдено: {people}. Нарушителей: {violators}.
    </span>
  </div>
);
