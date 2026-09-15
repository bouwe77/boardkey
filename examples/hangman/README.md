# boardkey hangman

A game of hangman built with [boardkey](../../README.md). The game is only
there to make the keyboard behaviour easy to follow: you already know how
hangman works, so the keys are the only new thing on the page.

Open the browser console while you play. Every key that no component handles is
logged there.

Run `npm run dev` from the root of the repository and open
http://localhost:38921/hangman. The Vite config aliases `boardkey` to `../src`,
so changes to the library reload right away.
