# Architecture rules

- Keep visual redesigns in presentation code and shared semantic theme tokens; existing Cloud data, bookings, and permission rules remain authoritative.
- Use SwapListingCard for the home and explore listing grids so real provider data receives consistent presentation.
- AppShell owns the single mobile navigation bar; individual pages must not create a duplicate fixed tab bar.