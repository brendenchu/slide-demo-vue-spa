# @bchu/utils

Pure TypeScript utility functions with no framework dependencies.

## Installation

```bash
pnpm add @bchu/utils
```

## Exports

### `divide(a, b, decimals?)`

Safe division returning `0` for divide-by-zero. Optional decimal precision (default: 2).

```typescript
import { divide } from '@bchu/utils'

divide(10, 3)     // 3.33
divide(10, 0)     // 0
divide(10, 3, 4)  // 3.3333
```

### `toMoney(value, locale?, currency?)`

Format a number as currency string.

```typescript
import { toMoney } from '@bchu/utils'

toMoney(1234.5)              // "$1,234.50"
toMoney(1234.5, 'de-DE', 'EUR')  // "1.234,50 €"
```

### `toPercent(value, decimals?)`

Format a number as a percentage string.

```typescript
import { toPercent } from '@bchu/utils'

toPercent(0.856)     // "85.60%"
toPercent(0.856, 0)  // "86%"
```

### `delay(ms)`

Promise-based delay.

```typescript
import { delay } from '@bchu/utils'

await delay(1000)  // wait 1 second
```

## Development

```bash
pnpm build    # tsc build
pnpm test     # vitest (watch mode)
```
