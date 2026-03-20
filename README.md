# Body Track

Веб-приложение для отслеживания показателей тела: вес, жир, мышечная масса, вода, белок, висцеральный жир, динамика и персональные рекомендации.

## Стек

- React + TypeScript + Vite
- Shadcn UI + Tailwind CSS
- Redux Toolkit + React Redux
- Firebase (Auth + Firestore + Analytics)
- React Router
- Framer Motion
- Vitest + Testing Library
- ESLint + Prettier
- Husky + lint-staged (pre-commit)
- PWA (`vite-plugin-pwa`)
- Vercel deployment config

## Быстрый старт

```bash
npm install
npm run dev
```

Открой [http://localhost:5173](http://localhost:5173).

## Команды

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run format
```

## Firebase

Конфиг уже подключен в `src/lib/firebase.ts` (с fallback на `.env`).

При необходимости создай `.env.local` по примеру:

```bash
cp .env.example .env.local
```

## Основной UX

- Старт: экран логина/регистрации (Google auth)
- Forgot password
- После регистрации: onboarding (возраст, рост, вес)
- Dashboard:
  - авторасчеты (ИМТ, идеальный вес, BMR, body score)
  - рекомендации и мотивация
  - графики динамики
  - история замеров
- Добавление замера через модалку с предзаполнением последними данными
- Светлая/темная тема
- Мобильный hamburger menu с темой и logout

## Pre-commit hook

При коммите автоматически запускается `lint-staged`:

- ESLint (`--fix`) для TS/JS файлов
- Prettier для форматируемых файлов

## Деплой на Vercel

Проект готов к SPA-деплою на Vercel (`vercel.json` уже добавлен).

```bash
npm run build
```

После подключения репозитория к Vercel сборка пройдет автоматически.
