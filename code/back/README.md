# Бэкенд

Принимает фото и зону от фронтенда, передаёт их в сервис нейросетей и возвращает результат.

## Стек

| Что | Чем |
|---|---|
| Язык | TypeScript |
| Фреймворк | NestJS |
| Загрузка файлов | Multer (встроен в NestJS) |
| Проверка входных данных | class-validator |
| Запросы к сервису нейросетей | @nestjs/axios |
| Документация API | Swagger (@nestjs/swagger) |
| Запуск | Docker |

База данных для MVP не нужна.

## API

`POST /api/detect` - принимает фото (multipart) и точки зоны (JSON), возвращает:

```json
{
  "violation": true,
  "zone": [[100, 200], [400, 200], [400, 500], [100, 500]],
  "people": [
    { "box": [120, 220, 180, 400], "helmet": false, "vest": true, "inZone": true, "violation": true }
  ]
}
```
