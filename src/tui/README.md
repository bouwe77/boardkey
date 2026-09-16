# boardkey/tui

Retro terminal-style components built on [boardkey](../../README.md):

```tsx
import { Panel, ListBox, Modal } from 'boardkey/tui'
```

They use `useKeys`, so they need a `KeyboardProvider` around them, and a modal
outranks the screen behind it for free. This is a separate entry point, so an
app that only uses the hooks never pulls any of it into its bundle.

The [TUI example](../../examples/tui) shows all of it together.

## Panel

The box every other component is made of: a border with the title in its top
border line.

```tsx
<Panel title="Settings" onClose={close} colors={colors} footer="esc = close">
  <p>Anything you like</p>
</Panel>
```

| Prop      | Type              | Meaning                                            |
| --------- | ----------------- | -------------------------------------------------- |
| `title`   | `string`          | Required. Shown in the top border line.            |
| `onClose` | `() => void`      | Adds an `X` and binds `escape`, `x` and `shift+x`. |
| `colors`  | `Partial<Colors>` | Only what you want to change.                      |
| `width`   | CSS width         | A fixed width. Default: whatever the layout gives. |
| `footer`  | `ReactNode`       | A line under the box, outside the border.          |

Without `onClose` the panel binds no keys at all. The footer defaults to
`esc, x = close` when it can be closed, and to nothing when it cannot.

## ListBox

Options in a panel, as high as the number of options.

```tsx
<ListBox title="Languages" options={['JavaScript', 'Python']} onSelect={pick} />
```

Adds these props to the ones of `Panel`:

| Prop       | Type                       | Meaning                                         |
| ---------- | -------------------------- | ----------------------------------------------- |
| `options`  | `string[]`                 | Required.                                       |
| `onSelect` | `(option: string) => void` | Enter, or a click, picked this option.          |
| `onChange` | `(option: string) => void` | The selection moved. Also called once on mount. |
| `active`   | `boolean`                  | Whether it owns the arrow keys. Default `true`. |

The arrow keys move the selection and wrap around at both ends, `enter` picks
the selected option, and a click picks one right away. The selection lives in
the component, so give it a `key` that changes with `options` when the
selection should start over.

### Two list boxes at once

Epochs rank by mount order, not by focus, so two list boxes side by side cannot
sort themselves out: the one that mounted last would always take the keys. The
app decides instead, and `active` carries the decision:

```tsx
const [focus, setFocus] = useState<'left' | 'right'>('left')

useKeys({
  arrowleft: () => setFocus('left'),
  arrowright: () => setFocus('right'),
})

<ListBox
  title="Language"
  options={LANGUAGES}
  active={focus === 'left'}
  onChange={setLanguage}
/>
<ListBox
  key={language}
  title="Framework"
  options={FRAMEWORKS[language]}
  active={focus === 'right'}
/>
```

The inactive one binds nothing at all, so both can use `arrowup` without any
conflict, and it is dimmed so it is clear where the keys will land. Epochs still
do their own job: a modal opened later outranks both.

## Modal

A backdrop that centres whatever you put in it. The content brings its own
panel, so there is no second border:

```tsx
{
  open && (
    <Modal onClose={close}>
      <ListBox title="Colors" options={sets} onClose={close} onSelect={apply} />
    </Modal>
  )
}
```

A modal mounts later than the screen below it, so it claims a higher epoch and
its keys win. Clicking the backdrop closes it.

## Hint

A key hint that is also a button, so every key has a mouse equivalent:

```tsx
<Hint onClick={open}>O = open dialog</Hint>
```

## Colors

Every component takes `colors`, a partial palette that is merged with the
defaults:

```tsx
interface Colors {
  title: string
  border: string
  background: string
  text: string
  selectedBackground: string
  selectedText: string
  page?: string // follows `background` until you set it
}
```

Also exported: `DEFAULT_COLORS`, `withDefaults(partial)` and
`pageColor(colors)`.
