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

### 2. Клонирование и установка

```bash
git clone <repo-url> aist-mono3-true
cd aist-mono3-true

npm install
```

### 3. Настройка базы данных

Создай новую базу:

```bash
createdb aist_mono3
```

### 4. Настройка переменных окружения

Создай файл `.env` в корне проекта:

```env
DATABASE_URL="postgresql://xsan@localhost:5432/aist_mono3?schema=public"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="...случайная_строка_64_символа..."

GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

OPENROUTER_API_KEY="sk-or-ваш-openrouter-key"

NODE_ENV="development"
```

`NEXTAUTH_SECRET` можно сгенерировать так:

```bash
openssl rand -base64 32
```

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

(Смотри файл `start-aist.sh` в корне проекта.)

***

## Настройка Google OAuth

1. Зайди в Google Cloud Console → **APIs & Services → Credentials**.
2. Создай **OAuth 2.0 Client ID**:
    - Application type: **Web application**
3. В `Authorized JavaScript origins` добавь:
    - `http://localhost:3000`
4. В `Authorized redirect URIs` добавь:
    - `http://localhost:3000/api/auth/callback/google`
5. Скопируй `Client ID` и `Client Secret` в `.env` (`GOOGLE_CLIENT_ID` и `GOOGLE_CLIENT_SECRET`).

***

## Поведение AI / препромт

Системное сообщение для AI задаётся в `src/app/api/chat/route.ts`:

```ts
let systemMessage = `
Ты — /AIST, цифровой ассистент и помощник по Беларуси.

Твоя роль:
- Помогаешь пользователю разбираться в бытовых, юридических, технологических и жизненных вопросах, особенно в контексте Беларуси.
- Объясняешь сложные вещи простыми словами.
- Пишешь структурированные ответы в вежливом, спокойном и немного неформальном тоне.

Правила общения:
- Говори от первого лица: "Я — /AIST, цифровой ассистент".
- Используй markdown.
- Если информации не хватает, честно говори об этом и предлагай, что можно уточнить.
`.trim();
```

При наличии загруженного файла содержимое файла добавляется в контекст в этом же эндпоинте.

***

## API эндпоинты (основные)

- `POST /api/auth/[...nextauth]` — авторизация (NextAuth)
- `POST /api/chat` — отправка сообщений в чат:
    - тело: `{ messages, chatId?, fileContext? }`
- `DELETE /api/chat?id=<chatId>` — удаление чата
- `POST /api/upload` — загрузка файлов и извлечение контента

***

## Скриншоты

Оставь сюда несколько блоков с изображениями после того, как сделаешь скрины интерфейса:

### Скриншот: Главный экран чата

> _здесь будет скриншот общего вида интерфейса_

### Скриншот: Чат с ответом AI

> _здесь будет скриншот диалога с /AIST_

### Скриншот: Загрузка файла и контекст

> _здесь будет скриншот с загруженным документом и ответом по нему_

***

## TODO / идеи для развития

- История чатов с боковой панелью.
- Выбор моделей OpenRouter и режимов (Беларусь / общий мир / техподдержка).
- Лимиты на размер файлов и более умная обработка больших документов.
- Локализация интерфейса (RU/EN switch).