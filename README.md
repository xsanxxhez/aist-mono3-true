# /AIST — Digital Assistant built with Next.js + Prisma

/AIST is a monolithic Next.js application featuring Google authentication (NextAuth), a PostgreSQL database, and an AI chat powered by OpenRouter (model: `deepseek/deepseek-chat`). It also supports working with uploaded files (PDF, DOCX, text, and images) by injecting file content into the model context.

***

## Features

- Google sign-in (NextAuth, JWT sessions).
- Personal chat with the **/AIST** assistant:
  - responds in the style of a “digital assistant and Belarus-focused helper”;
  - supports Markdown formatting (headings, lists, code blocks, etc.).
- File uploads:
  - PDF, Word documents, text files, images;
  - extracted file content is added to the model context.
- Chat history:
  - chats and messages are stored in PostgreSQL (via Prisma);
  - chats can be deleted.

***

## Tech Stack

- **Next.js 15** (App Router, `src/app`)
- **React 19**
- **NextAuth** (Google OAuth, JWT sessions)
- **Prisma ORM** + PostgreSQL
- **OpenRouter** (model `deepseek/deepseek-chat`)
- Markdown parsing/rendering: `remark`, `remark-html`

***

## Quick Start (Local Development)

### 1) Prerequisites

- Node.js (18+)
- PostgreSQL (e.g., installed via Homebrew on macOS):
  - service running on port `5432`
- OpenRouter account + API key
- (Optional) Google Cloud OAuth Client for Google login

### 5) Prisma: Generate + Migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

The database schema is generated from `prisma/schema.prisma` and migrations in `prisma/migrations`.

### 6) Run the dev server

```bash
npm run dev
```

The application will be available at:

- frontend + API: `http://localhost:3000`
- NextAuth callback: `http://localhost:3000/api/auth/callback/google`

***

## Launch Script

You can add a convenient script called `start-aist.sh`:

```bash
./start-aist.sh
```

It will:

- verify that PostgreSQL is running;
- verify that a `.env` file exists;
- run `prisma generate` and `prisma migrate deploy`;
- start `npm run dev` and write logs to `/tmp/aist-mono3-dev.log`.

***

## API Endpoints (Main)

- `POST /api/auth/[...nextauth]` — authentication (NextAuth)
- `POST /api/chat` — send messages to the chat:
  - body: `{ messages, chatId?, fileContext? }`
- `DELETE /api/chat?id=<chatId>` — delete a chat
- `POST /api/upload` — upload files and extract content

***

## Screenshots

### Main screen
<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/acb770df-cbdd-4311-9052-d75e9a206c40" />

### Chat with AI response
<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/7135bc9d-4aa9-4e49-b3e4-5324e74ba913" />

### File upload + context
<img width="1710" height="1107" alt="image" src="https://github.com/user-attachments/assets/b0f276e8-4acf-4e13-88ce-e324842513ab" />

***

## TODO / Future Ideas

- Chat history with a sidebar.
- Model selection in OpenRouter and “modes” (Belarus / global / tech support).
- File size limits and smarter handling of large documents.
- UI localization (RU/EN switch).
