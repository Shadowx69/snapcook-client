# SnapCook Frontend

## Tech Stack
- **React 19** + **Vite 8** (dev server port 3000)
- **React Router v7** — client-side routing
- **@react-oauth/google** — Google OAuth (client_id only on frontend)
- **lucide-react** — icons
- **No Redux, no Firebase, no UI component library**

## Auth System
- JWT stored in `localStorage` key `'snapcook_token'`
- On mount: if token exists → `GET /api/auth/me` to restore session
- API client reads token from localStorage and injects `Authorization: Bearer <token>` header
- Google OAuth: `@react-oauth/google` returns a credential (ID token) → sent to backend `POST /api/auth/google`
- Env var for Google OAuth: `VITE_GOOGLE_CLIENT_ID`

## API
- Base URL: `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`
- All API modules in `src/api/` — one file per domain
- `src/api/client.js` — core HTTP client (get/post/put/patch/delete/upload methods)
- Vite dev proxy: `/api` → `http://localhost:5000` (for development)

## Folder Structure
```
src/
├── api/           HTTP service modules (client.js, recipes.js, users.js, snap.js, cuisines.js, mealPlanner.js, collections.js)
├── components/    Shared UI (RecipeCard, StarRating, NutritionBadge, SectionHeader, Spinner, ErrorBanner, Toast)
├── context/       AuthContext (JWT auth), ThemeContext (light/dark + accent color)
├── data/          mockData.js — static UI reference arrays (categories, cuisines list, etc.) NOT real data
├── hooks/         useFetch (base), useRecipes family, useProfile family, useCuisine family, useMealPlanner, useCollections
├── pages/         14 route pages + settings/ sub-pages
│   └── settings/  EditProfile, ChangePassword, LinkedAccounts, Preferences, PrivacyPolicy, Support
├── assets/        Static images
├── App.jsx        Router, TopNav, BottomNav, AuthGuard, ScrollToTop
├── main.jsx       React DOM entry + GoogleOAuthProvider wrapper
└── index.css      All CSS variables (design tokens) — DO NOT modify variable names
```

## Key Patterns
- **Data fetching**: `useFetch(apiFn, deps)` → returns `{ data, loading, error, refetch }`
- **Feature hooks**: wrap `useFetch` per domain (e.g., `useRecipes`, `useProfile`)
- **Global state**: Context API only — no Redux/Zustand
- **Forms**: manual validation with inline error state, no form libraries
- **Loading**: `<Spinner>` / `<PageLoader>` from `src/components/Spinner.jsx`
- **Errors**: `<ErrorBanner message="..." onRetry={refetch}>` from `src/components/ErrorBanner.jsx`
- **Toasts**: `<Toast message="..." onClose={() => setToast(null)}>` — auto-dismiss in 2.8s

## Theming
- CSS custom properties on `<html>` element — see `src/index.css`
- `[data-theme="light"]` / `[data-theme="dark"]` on `<html>`
- Primary accent color: `--color-primary` (set by ThemeContext)
- ThemeContext: `useTheme()` → `{ theme, setTheme, primaryColor, setPrimaryColor }`
- Accent saved to `localStorage` key `'snapcook_accent'`

## Routes
- `/` Home, `/auth` Auth, `/onboarding` Onboarding, `/snap` Snap
- `/search` Search, `/explore` Explore, `/recipes` Recipes, `/recipe/:id` RecipeDetail
- `/cuisine/:id` CuisinePage, `/meal-planner` MealPlanner
- `/profile` Profile, `/settings` Settings hub
- `/settings/edit-profile`, `/settings/change-password`, `/settings/linked-accounts`
- `/settings/preferences`, `/settings/privacy`, `/settings/support`

## Do Not Change
- CSS variable names in `src/index.css` — used throughout all components
- Page layout structure and visual design — only wire up logic
- `src/data/mockData.js` — UI reference only, not displayed as real data
- Vite dev server port (3000)
