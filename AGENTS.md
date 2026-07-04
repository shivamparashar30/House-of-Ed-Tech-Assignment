# Bingebox — Agent Guide

> **Expo changes fast.** Read the exact versioned docs at
> https://docs.expo.dev/versions/v56.0.0/ before writing any code.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Expo SDK 56 with React 19.2 and React Native 0.85 |
| Routing | Expo Router (file-based routing under `src/app/`, `expo-router@~56.x`) |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| Language | TypeScript (strict mode) |
| Package Manager | npm (this repo uses `package-lock.json`) |
| State Management | Zustand |
| Data Fetching | TanStack Query (React Query) |
| Query Key Management | `@lukemorales/query-key-factory` |
| Animations | React Native Reanimated + React Native Gesture Handler |
| Linting | ESLint with `eslint-config-expo` |

> **Installed:** `expo`, `expo-router`, `nativewind` + `tailwindcss`,
> `react-native-reanimated`, `react-native-gesture-handler`, `expo-image`,
> `expo-linear-gradient`, `expo-font`, `expo-splash-screen`, `expo-symbols`,
> `@expo/vector-icons`, `react-native-webview`, `zustand`,
> `@tanstack/react-query`, `@lukemorales/query-key-factory`, `clsx` +
> `tailwind-merge` (the `cn` utility), `@react-native-async-storage/async-storage`,
> plus the SDK 56 core.

## Data Source

- **TMDB** (themoviedb.org) powers all discovery data (trending, popular, top
  rated, upcoming, search, details, cast, similar). Requires a free v4 read
  access token in `.env` as `EXPO_PUBLIC_TMDB_ACCESS_TOKEN` (see `.env.example`).
- **Vidking** (`vidking.net/embed/movie/{tmdbId}`) is playback only — an
  embeddable player loaded in a WebView. It has no metadata/search API.
- The HTTP client lives in `src/api/client.ts`; pure endpoint functions in
  `src/api/movies.ts`; response types narrowed in `src/api/types.ts`.

## Project Structure

This project uses a `src/` root (configured via the `@/*` → `./src/*` path alias
in `tsconfig.json`). Create the convention directories below the first time a
feature needs them.

```
src/
  app/                  # Expo Router pages (file-based routing)
    _layout.tsx         # Root layout (theme provider, tabs)
    index.tsx           # Home screen
    explore.tsx         # Explore screen
  components/           # Reusable UI components
    ui/                 # Primitive UI components (icons, collapsible, etc.)
  constants/            # App-wide constants (theme colors, fonts, etc.)
    theme.ts
  lib/                  # Utility functions
    cn.ts               # Class name merge utility (clsx + tailwind-merge)
  hooks/                # Custom React hooks (incl. query hooks)
  queries/             # Query key definitions (@lukemorales/query-key-factory)
    index.ts            # Merged query keys (mergeQueryKeys)
    users.ts            # Example: domain-specific query keys
  api/                  # API service functions (pure fetch/axios calls)
  stores/              # Zustand stores (one per domain/feature)
  global.css           # Tailwind CSS entry point
assets/                 # Static assets (images, fonts)
scripts/                # Build/utility scripts
tailwind.config.js      # Tailwind + NativeWind config
metro.config.js         # Metro bundler with NativeWind
babel.config.js         # babel-preset-expo (jsxImportSource: nativewind) + nativewind/babel
```

> Import with the `@/` alias (e.g. `import { cn } from "@/lib/cn"`,
> `import "@/global.css"`). `global.css` is imported once in `src/app/_layout.tsx`.

## Code Principles

### Readability First
Write code that is readable and understandable at a glance. Prefer longer,
explicit code over clever or hacky syntax. No tricks, no terse one-liners. Every
line should communicate intent clearly.

### Separation of Concerns
Never put logic inside components. Components are for rendering only. Use hooks,
utils, libs, and helper functions to keep logic separate from the view layer.
Business logic belongs in hooks or utility files. Components only call hooks and
render output.

### File Naming
Use kebab-case for all new files (e.g., `use-watchlist.ts`, `media-card.tsx`,
`format-runtime.ts`).

### Pure Functions & Single Responsibility
Each function should do one thing only (Single Responsibility Principle).
Functions must be pure — no side effects. Given the same input, always return the
same output. Side effects (API calls, state mutations, etc.) belong in hooks or
dedicated service functions, not in utility/helper functions.

### Clean Code
Follow clean code principles throughout. Keep files focused — one logical concern
per file. Reusable logic should be extracted into its own file. Avoid
duplication. If logic appears more than once, extract it. Do not add defensive
generic field readers for data that the API contract guarantees. Fix or narrow
the type at the API boundary, then use the typed fields directly.

### Component Rendering
Prefer early returns for large conditional UI states such as loading, error,
empty, and success content. Avoid stacking large JSX blocks behind inline
conditions like `{!isLoading && ...}` because it makes components harder to scan.
Inline conditional rendering is fine for small, local UI fragments only.

## Styling

- Use NativeWind (Tailwind CSS classes) for all styling.
- Use Tailwind's built-in scale for spacing, sizing, and typography. Use
  arbitrary values (e.g. `w-[172px]`, `text-[11px]`) for one-off measurements —
  do not add them to `tailwind.config.js`.
- Only add a color to `tailwind.config.js` if it is a true design token used
  across the whole app (e.g. `brand`, `surface`, `success`). Component-specific
  colors must be hardcoded as arbitrary values (e.g. `bg-[#E8E9EA]`). Never
  create per-component config entries.
- Style classes should be readable and easy to review at a glance.
- Global styles live in `src/global.css`; theme constants in
  `src/constants/theme.ts`.

Always use the `cn()` utility from `@/lib/cn` to merge conditional class names.
Never use template literals or string concatenation for classes.

```tsx
// ❌ Bad — template literals
<View className={`flex-1 bg-white ${isActive ? "border-blue-500" : "border-gray-200"}`} />

// ✅ Good — cn utility
import { cn } from "@/lib/cn";

<View className={cn("flex-1 bg-white", isActive && "border-blue-500", !isActive && "border-gray-200")} />
```

`src/lib/cn.ts` (create on first use):

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

## Dependencies

- Be extremely deliberate about adding new dependencies. Every dependency
  increases app size.
- Only add packages that are absolutely needed and provide significant value.
- Before adding a dependency, consider whether the functionality can be achieved
  with built-in APIs or existing packages already in the project.
- Install Expo-managed packages with `npx expo install <pkg>` so versions stay
  aligned with SDK 56.

## Data Fetching

- All API requests must use TanStack Query — never call APIs directly in
  components or effects.
- Use `@lukemorales/query-key-factory` to manage all query keys in a structured,
  type-safe way.
- Never hardcode query keys in hooks or components. Always reference them through
  the query key store.

### Query Key Structure

Define query keys in separate files under `src/queries/`, one file per domain,
then merge them in `src/queries/index.ts`:

```ts
// src/queries/users.ts
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { api } from "@/api/users";

export const users = createQueryKeys("users", {
  all: null,
  detail: (userId: string) => ({
    queryKey: [userId],
    queryFn: () => api.getUser(userId),
  }),
});
```

```ts
// src/queries/todos.ts
import { createQueryKeys } from "@lukemorales/query-key-factory";
import { api } from "@/api/todos";

export const todos = createQueryKeys("todos", {
  detail: (todoId: string) => [todoId],
  list: (filters: TodoFilters) => ({
    queryKey: [{ filters }],
    queryFn: (ctx) => api.getTodos({ filters, page: ctx.pageParam }),
    contextQueries: {
      search: (query: string, limit = 15) => ({
        queryKey: [query, limit],
        queryFn: (ctx) =>
          api.getSearchTodos({ page: ctx.pageParam, filters, limit, query }),
      }),
    },
  }),
});
```

```ts
// src/queries/index.ts
import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { users } from "./users";
import { todos } from "./todos";

export const queries = mergeQueryKeys(users, todos);
```

### Query Hooks

Wrap every query in a custom hook inside `src/hooks/`. Hooks consume the query
key store and return the TanStack Query result:

```ts
// src/hooks/use-users.ts
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { api } from "@/api/users";

export function useUsers() {
  return useQuery({
    ...queries.users.all,
    queryFn: () => api.getUsers(),
  });
}

export function useUserDetail(id: string) {
  return useQuery(queries.users.detail(id));
}
```

```ts
// src/hooks/use-todos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queries } from "@/queries";
import { api } from "@/api/todos";

export function useTodos(filters: TodoFilters) {
  return useQuery(queries.todos.list(filters));
}

export function useSearchTodos(filters: TodoFilters, query: string, limit = 15) {
  return useQuery({
    ...queries.todos.list(filters)._ctx.search(query, limit),
    enabled: Boolean(query),
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();

  return useMutation(api.updateTodo, {
    onSuccess(newTodo) {
      queryClient.setQueryData(queries.todos.detail(newTodo.id).queryKey, newTodo);
      queryClient.invalidateQueries({
        queryKey: queries.todos.list._def,
        refetchActive: false,
      });
    },
  });
}
```

## API Layer

- Pure API functions live in `src/api/` — they handle fetch/axios calls only, no
  state or query logic.
- API functions should be pure — take input, return data, no side effects.
- Each domain gets its own file (e.g., `src/api/users.ts`, `src/api/media.ts`).

## State Management

- Use Zustand for global state.
- Keep stores focused and modular — one store per domain/feature.
- Store files follow kebab-case naming and live in `src/stores/`.

## Git Commits

- Follow Conventional Commits format (e.g., `feat: add watchlist screen`,
  `fix: resolve crash on playback`).
- Commit messages must be under 50 characters.
- No description/body in commits — keep it to just the subject line.
- Prefixes: `feat:`, `fix:`, `refactor:`, `chore:`, `style:`, `docs:`, `test:`.

## Testing & Verification

- Run `npm run lint` after making changes to ensure code quality.
- Run `npx tsc --noEmit` to confirm types compile.
- Always verify changes compile correctly before considering the task done.

## Environment Note

Expo SDK 56 requires **Node 20+**. This repo pins Node 22 via `.nvmrc` — run
`nvm use` before any `npm`/`expo` command.
