# boardkey vi

A very small vi clone built with [boardkey](../../README.md). vi is the clearest
example of what this library is for: the same keys mean different things
depending on the mode, and while you type, the keyboard belongs to the input.

Three modes, three `useKeys` calls, each with its own `active` flag:

- **Normal** — `h` `j` `k` `l` move the cursor, `i` starts insert mode, `:`
  opens the command line.
- **Insert** — the current line becomes a real `<input>` that calls `useMute`.
  While muted, only the highest-epoch registration handles keys, and that is the
  input itself. So `h` types an h instead of moving the cursor, but `Escape`
  still gets you out.
- **Command** — the same trick at the bottom of the screen. `:w` saves the
  buffer to your downloads folder and `:w other.txt` saves it under that name,
  the way vi writes a copy without renaming the file you are editing. `:q`
  starts over, `:wq` does both. Anything else gets the vi error message.

The status line also shows keys that nothing handles. Those come from
`onUnhandled` on the provider.

While insert mode is muted, `F1`…`F4` do not switch examples. That is correct:
mute means the app is typing, so nothing below the input gets a turn.

## Not supported

This is a demo of the modes, not an editor. There is no `x`, `dd`, `u`, `w`,
`gg`, `G`, `0` or `$`, no counts like `3j`, no visual mode, no yank and paste,
no search, no `:saveas` or `:f` to rename the buffer, and no way to open a
file.

Run `npm run dev` from the root of the repository and open
http://localhost:38921/vi. The Vite config aliases `boardkey` to `../src`, so
changes to the library reload right away.
