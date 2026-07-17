# SportTracker — PWA для учёта тренировок

Приложение для учёта силовых тренировок с таймером, историей и синхронизацией между устройствами.  
Работает как **Progressive Web App (PWA)** — устанавливается на домашний экран.

Открыть: http://localhost:3000/sporttracker/

На экране авторизации выбрать «У меня есть токен» и ввести любой UUID (например 00000000-0000-0000-0000-000000000001)

---

## Стек

| Технология | Назначение |
|---|---|
| **Next.js 16** (App Router) + **TypeScript 6** | Фреймворк, статический экспорт |
| **SCSS Modules** | Стилизация (CSS modules + Sass) |
| **Zustand** (persist middleware) | Управление состоянием, localStorage |
| **uuid** (v4) | Генерация ID для сущностей |
| **React 19** + **React DOM 19** | UI |
| **Chart.js** + **react-chartjs-2** | Графики аналитики |
| **PHP 8.1** | Backend API |
| **PostgreSQL** | База данных |

---

## Архитектура

```
Браузер (Next.js static export)
  ↕ fetch() — JSON API
PHP API (Apache + PHP 8.1)
  ↕ PDO
PostgreSQL
```

- **Frontend**: Next.js собирается в статику (`output: 'export'`), деплоится как HTML+JS+CSS
- **Backend**: PHP-скрипты, обрабатывающие JSON-запросы
- **База данных**: PostgreSQL, 3 таблицы
- **Деплой**: приложение живёт в подпапке `/sporttracker/` на WordPress-сайте (Apache 2.4)

---

## Структура проекта

```
my-app/
├── api/                              # PHP backend
│   ├── db.php                        #   PDO подключение к PostgreSQL
│   ├── helpers.php                   #   Вспомогательные функции
│   ├── auth.php                      #   Проверка Bearer-токена
│   ├── register.php                  #   POST — регистрация устройства
│   ├── trainings.php                 #   GET/POST — тренировки
│   ├── custom-exercises.php          #   GET/POST — кастомные упражнения
│   └── migration.sql                 #   DDL для создания таблиц
├── public/
│   ├── sw.js                         #   Service Worker (offline-кэш)
│   ├── icon-192x192.{svg,png}        #   PWA иконки
│   ├── icon-512x512.{svg,png}        #
│   └── manifest.webmanifest          #   PWA манифест (генерируется Next.js)
├── src/
│   ├── app/                          #   Next.js App Router
│   │   ├── layout.tsx                #     Root layout
│   │   ├── globals.scss              #     Глобальные стили, CSS-переменные
│   │   ├── manifest.ts               #     PWA Web App Manifest route
│   │   ├── page.tsx                  #     Стартовая страница (/) + авторизация
│   │   ├── page.module.scss
│   │   ├── training/
│   │   │   ├── page.tsx              #     Тренировка (/training)
│   │   │   └── training.module.scss
│   │   ├── history/
│   │   │   ├── page.tsx              #     История (/history)
│   │   │   └── history.module.scss
│   │   └── analytics/
│   │       ├── page.tsx              #     Аналитика (/analytics)
│   │       └── analytics.module.scss
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx            #     Кнопка (default/ghost/outline/destructive)
│   │   │   ├── input.tsx             #     Поле ввода
│   │   │   └── card.tsx              #     Карточка-контейнер
│   │   ├── timer.tsx                 #     Таймер ЧЧ:ММ:СС
│   │   ├── set-row.tsx               #     Строка подхода
│   │   ├── exercise-card.tsx         #     Карточка упражнения с таблицей подходов
│   │   ├── exercise-name-dialog.tsx  #     Диалог выбора названия упражнения
│   │   ├── training-calendar.tsx     #     Календарь для истории
│   │   ├── day-detail-modal.tsx      #     Модалка с деталями тренировки
│   │   └── install-prompt.tsx        #     Баннер установки PWA
│   ├── hooks/
│   │   └── use-timer.ts              #     Хук таймера
│   └── lib/
│       ├── types.ts                  #     TypeScript-интерфейсы
│       ├── store.ts                  #     Zustand store (состояние + экшены)
│       └── api.ts                    #     API-клиент (fetch-обёртка)
├── next.config.mjs                   #   Next.js конфиг (static export + basePath)
├── tsconfig.json
├── package.json
├── AGENTS.md
└── README.md
```

---

## Маршруты

| URL | Компонент | Описание |
|---|---|---|
| `/` | `page.tsx` | Стартовый экран: авторизация, Start/Continue, ссылки |
| `/training` | `training/page.tsx` | Активная тренировка: таймер, упражнения, подходы |
| `/history` | `history/page.tsx` | Календарь истории с деталями по дням |
| `/analytics` | `analytics/page.tsx` | Графики КПШ и тоннажа по упражнениям |
| `/manifest.webmanifest` | `manifest.ts` | PWA Web App Manifest |

---

## Модели данных

### TypeScript (`src/lib/types.ts`)

```typescript
// Подход
interface Set { id: string; reps: number; weight: number }

// Упражнение
interface Exercise { id: string; name: string; sets: Set[] }

// Завершённая тренировка
interface CompletedTraining {
  id: string;
  exercises: Exercise[];
  duration: number;     // секунды
  completedAt: string;  // ISO 8601
}
```

### PostgreSQL (`api/migration.sql`)

```sql
sporttracker_users
├── id          UUID PRIMARY KEY
├── token       VARCHAR(64) UNIQUE NOT NULL
└── created_at  TIMESTAMP

sporttracker_trainings
├── id          UUID PRIMARY KEY
├── user_id     UUID → users(id) ON DELETE CASCADE
├── exercises   JSONB
├── duration    INTEGER
├── completed_at TIMESTAMP
└── created_at  TIMESTAMP

sporttracker_custom_exercises
├── id          SERIAL PRIMARY KEY
├── user_id     UUID → users(id) ON DELETE CASCADE
├── name        VARCHAR(255)
└── UNIQUE(user_id, name)
```

---

## Состояние (Zustand store)

Store использует `persist` middleware с ключом `training-storage-v2`.

### Локально (localStorage)
- `exercises`, `startTime`, `isActive` — текущая незавершённая тренировка
- `token` — UUID для авторизации
- `history`, `customExercises` — кэш для offline

### На сервере (через API)
- `history` — все завершённые тренировки
- `customExercises` — пользовательские названия упражнений

### Экшены

| Метод | Описание |
|---|---|
| `startTraining()` | Начать новую тренировку |
| `finishTraining()` | Завершить, вернуть `CompletedTraining \| null` |
| `loadFromServer()` | Загрузить историю + кастомные упражнения |
| `saveTrainingToServer(training)` | Сохранить тренировку на сервер |
| `registerDevice()` | Создать нового пользователя → UUID |
| `setToken(token)` | Установить токен (при входе с другого устройства) |
| `addExercise(name?)` | Добавить упражнение |
| `removeExercise(id)` | Удалить упражнение |
| `addSet(exerciseId)` | Добавить подход |
| `removeSet(exerciseId, setId)` | Удалить подход |
| `updateExerciseName(id, name)` | Переименовать упражнение |
| `updateSet(exerciseId, setId, field, value)` | Обновить reps/weight |
| `addCustomExercise(name)` | Добавить кастомное название |

---

## API endpoints

Все эндпоинты принимают/возвращают JSON.  
Токен передаётся в query-параметре `?token=...` (работает для GET и POST).

| Метод | URL | Тело | Ответ | Авторизация |
|---|---|---|---|---|
| POST | `/api/register.php` | — | `{token: "uuid"}` | ❌ |
| GET | `/api/trainings.php` | — | `{history: [...], customExercises: [...]}` | ✅ |
| POST | `/api/trainings.php` | `{id, exercises, duration, completedAt}` | `{history: [...]}` | ✅ |
| GET | `/api/custom-exercises.php` | — | `{customExercises: [...]}` | ✅ |
| POST | `/api/custom-exercises.php` | `{name}` | `{ok: true}` | ✅ |

Токен также принимается в заголовке `Authorization: Bearer <token>` (если Apache настроен на его пропуск).

---

## Авторизация

- **При первом запуске** на устройстве показывается экран: "Новое устройство" или "У меня есть токен"
- **"Новое устройство"** → POST `/api/register.php` → создаётся пользователь, возвращается UUID
- **"У меня есть токен"** → пользователь вводит UUID с другого устройства
- Токен сохраняется в localStorage, при следующем открытии данные подтягиваются с сервера
- Несколько устройств с одним токеном = одна общая история

---

## Команды

| Команда | Описание |
|---|---|
| `npm run dev` | Режим разработки (Next.js dev server with basePath) |
| `npm run build` | Production сборка → папка `out/` |
| `npm start` | Serve production сборки (если доступен Node.js) |
| `npm run lint` | ESLint |
| `npm install` | Установка зависимостей |

---

## Деплой на сервер

### 1. База данных

```bash
psql -U postgres -d your_database -f api/migration.sql
```

Настроить подключение через переменные окружения или отредактировать `api/db.php`:

| Переменная | По умолчанию |
|---|---|
| `SPORTTRACKER_DB_HOST` | `localhost` |
| `SPORTTRACKER_DB_PORT` | `5432` |
| `SPORTTRACKER_DB_NAME` | `sporttracker` |
| `SPORTTRACKER_DB_USER` | `postgres` |
| `SPORTTRACKER_DB_PASS` | (пусто) |

### 2. Сборка

```bash
npm run build
```

### 3. Копирование на сервер

```
out/*   → /public_html/sporttracker/
api/*   → /public_html/sporttracker/api/
```

### 4. Права доступа

```bash
chmod -R 755 /public_html/sporttracker/
chmod 644 /public_html/sporttracker/*.html
chmod 644 /public_html/sporttracker/api/*.php
```

### 5. Настройки Apache

- Должен быть включён `mod_rewrite` и `mod_php` (или `php-fpm`)
- `AllowOverride` — не обязателен (`.htaccess` не используется)
- PHP должен иметь модуль `pdo_pgsql`

---

## PWA

### Web App Manifest

Генерируется `src/app/manifest.ts`, отдаётся по пути `/sporttracker/manifest.webmanifest`.

### Service Worker

`public/sw.js` — стратегия:
- **Navigation**: Network First → cache fallback → корневая страница
- **Static assets**: Cache First → fetch if miss
- **API-запросы** (`/sporttracker/api/`): пропускаются (не кэшируются)

### Иконки

- `/sporttracker/icon-192x192.png` (192×192)
- `/sporttracker/icon-512x512.png` (512×512)

---

## Стилизация

- **Цветовая схема**: чёрно-белая (`--dark: #1E1D27`, `--light: #F3F7F8`, `--accent: #F6D506`)
- **Border-radius**: `0` везде (прямые углы)
- **SCSS Modules** — CSS modules + Sass, префикс `.module.scss`
- **Анимации**: `fadeIn` (0.2s) и `slideUp` (0.2s)
- **Адаптив**: контейнер max-width 38rem

---

## Особенности

- Пустые названия упражнений (`name.trim() === ''`) и упражнения с нулевыми повторениями во всех подходах отфильтровываются при завершении тренировки
- Тренировка сохраняется локально (localStorage) **и** на сервере (fire-and-forget). Если сервер недоступен — данные не теряются
- Duration считается по wall-clock: `Math.floor((Date.now() - startTime) / 1000)`
- При обновлении страницы во время тренировки данные не теряются (persist в localStorage)
