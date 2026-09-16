# boardkey sandbox

A place to try strange things and see whether boardkey survives them. It is not
meant to look nice or to be realistic: every screen here exists to check one
piece of behaviour in a real browser, so edge cases get found before a user
finds them.

What it covers today: a counter on the arrow keys, a modal that takes the same
keys over, and a text input that mutes the app while you type. Open the browser
console to follow which component owns the keyboard.

The same modal opens two ways, to show what mute changes. **M** opens it muted
and **N** opens it unmuted. Neither one binds ←/→. Muted, those keys do nothing,
because a muted component stops every key, not only the ones it binds. Unmuted,
they still change the app counter behind the modal, because epochs work per key.

New odd cases belong here. For what boardkey is meant to look like in a real
app, see the [TUI](../tui) and [hangman](../hangman) examples.

Run `npm run dev` from the root of the repository and open
http://localhost:38921/sandbox. The Vite config aliases `boardkey` to `../src`,
so changes to the library reload right away.
