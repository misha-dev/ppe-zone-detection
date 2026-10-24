import type { FC } from 'react';
import { STATUS_LABELS } from '../constants';
import type { PeopleListProps } from '../types';
import { getPersonStatus } from '../utils/person';

export const PeopleList: FC<PeopleListProps> = ({ people }) => {
  if (people.length === 0) return <p className="hint">Люди на фото не найдены.</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>№</th>
          <th>Каска</th>
          <th>Жилет</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        {people.map((person, index) => {
          const status = getPersonStatus(person);
          return (
            <tr key={index} className={`table__row--${status}`}>
              <td>{index + 1}</td>
              <td>{person.helmet ? 'Да' : 'Нет'}</td>
              <td>{person.vest ? 'Да' : 'Нет'}</td>
              <td>
                <span className={`badge badge--${status}`}>{STATUS_LABELS[status]}</span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
