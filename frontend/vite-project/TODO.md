# UI “Official” Refinement - TODO

## Step 1: Add design-system utilities
- [ ] Update `src/index.css` with CSS variables (dark+gold) and reusable classes: `ui-container`, `ui-card`, `ui-btn-*`, `ui-field`.
- [x] Add consistent focus rings for inputs/selects/textarea




## Step 2: Refactor shared layout components
- [ ] Update `src/components/Navbar.jsx` to use design-system button/panel styles.
- [ ] Update `src/components/Footer.jsx` to use consistent card/border styles.

## Step 3: Refactor pages (no logic changes)
- [ ] Update `src/pages/Home.jsx` to use `ui-card`, `ui-btn-*`, `ui-field`.
- [ ] Update `src/pages/Hotels.jsx` to use consistent UI primitives.
- [ ] Update `src/pages/HotelDetails.jsx` to use consistent UI primitives for room cards + booking form.
- [ ] Update `src/pages/Booking.jsx` to use consistent UI primitives for booking cards.
- [ ] Update `src/pages/Login.jsx` to use `ui-card` + `ui-field` + `ui-btn-primary`.
- [ ] Update `src/pages/Register.jsx` to use `ui-card` + `ui-field` + `ui-btn-primary`.

## Step 4: Optional polish
- [ ] Ensure `src/components/HotelCard.jsx` matches the new `.ui-card` aesthetic.

## Step 5: Test
- [ ] Run frontend and visually verify routes: `/`, `/hotels`, `/hotels/:id`, `/bookings`, `/login`, `/register`.
- [ ] Sanity check: focus/hover/disabled states and responsiveness.

