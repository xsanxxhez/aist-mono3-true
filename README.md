# /AIST – Цифровой ассистент на Next.js + Prisma

/AIST — это монолитное приложение на Next.js с авторизацией через Google (NextAuth), базой данных на PostgreSQL и AI‑чатом, который использует OpenRouter (модель `deepseek/deepseek-chat`) и умеет работать с загруженными файлами (PDF, DOCX, текст и изображения).

***

## Возможности

- Авторизация через Google (NextAuth, JWT‑сессии).
- Личный чат с AI‑ассистентом **/AIST**:
    - отвечает в стиле «цифровой ассистент и помощник по Беларуси»;
    - поддерживает markdown‑форматирование (заголовки, списки, код и т.д.).
- Загрузка файлов:
    - PDF, Word, текстовые файлы, изображения;
    - контент файла попадает в контекст для модели.
- История чатов:
    - сохранение чатов и сообщений в PostgreSQL (через Prisma);
    - возможность удалять чаты.

***

## Технологии

- **Next.js 15** (App Router, `src/app`)
- **React 19**
- **NextAuth** (Google OAuth, JWT‑сессии)
- **Prisma ORM** + PostgreSQL
- **OpenRouter** (модель `deepseek/deepseek-chat`)
- Парсинг и рендеринг markdown: `remark`, `remark-html`

***

## Быстрый старт (локальная разработка)

### 1. Предварительные требования

- Node.js (18+)
- PostgreSQL (например, установлено через Homebrew на macOS):
    - сервис на порту `5432`
- Аккаунт на OpenRouter с API‑ключом
- (Опционально) Google Cloud OAuth Client для продвинутого входа



### 5. Prisma: генерация и миграции

```bash
npx prisma generate
npx prisma migrate deploy
```

База будет создана на основе `prisma/schema.prisma` и миграций в `prisma/migrations`.

### 6. Запуск dev‑сервера

```bash
npm run dev
```

Приложение будет доступно по адресу:

- фронтенд + API: `http://localhost:3000`
- NextAuth коллбек: `http://localhost:3000/api/auth/callback/google`

***

## Скрипт запуска

В проекте можно добавить удобный скрипт `start-aist.sh`:

```bash
./start-aist.sh
```

Он:

- проверяет, что PostgreSQL запущен;
- проверяет наличие `.env`;
- запускает Prisma `generate` и `migrate deploy`;
- стартует `npm run dev` и пишет логи в `/tmp/aist-mono3-dev.log`.


***

## API эндпоинты (основные)

- `POST /api/auth/[...nextauth]` — авторизация (NextAuth)
- `POST /api/chat` — отправка сообщений в чат:
    - тело: `{ messages, chatId?, fileContext? }`
- `DELETE /api/chat?id=<chatId>` — удаление чата
- `POST /api/upload` — загрузка файлов и извлечение контента

***

## Скриншоты


### Главный экран 
<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/acb770df-cbdd-4311-9052-d75e9a206c40" />




### Чат с ответом AI
<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/7135bc9d-4aa9-4e49-b3e4-5324e74ba913" />


### Загрузка файла и контекст

<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/b0f276e8-4acf-4e13-88ce-e324842513ab" />

***

## TODO / идеи для развития

- История чатов с боковой панелью.
- Выбор моделей OpenRouter и режимов (Беларусь / общий мир / техподдержка).
- Лимиты на размер файлов и более умная обработка больших документов.
- Локализация интерфейса (RU/EN switch).
