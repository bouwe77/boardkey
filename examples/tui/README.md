# boardkey TUI

A retro looking TUI app built with [boardkey](../../README.md). The components
themselves are part of the library, in [`src/tui`](../../src/tui), and this app
imports them from `boardkey/tui`. What stays here is the demo around them: the
sidebar, the colour sets and the screen.

- `Panel` — the chrome every component shares: a box with a title in its top
  border line. With `onClose` it also shows an `X` and binds escape and `x`.
- `ListBox` — options in a panel, as high as the number of options. The arrow
  keys move the selection and wrap around at both ends, enter picks one.
- `Modal` — puts a panel on top of everything. It mounts last, so its epoch is
  the highest and its keys win from the screen behind it.

The language and its frameworks are two list boxes at once, which needs the other
half of boardkey: `←` and `→` move the focus, and only the focused list binds
the up and down keys. Epochs handle stacking, `active` handles focus.

Run `npm run dev` from the root of the repository and open
http://localhost:38921/tui.
