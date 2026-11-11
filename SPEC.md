# Spec: Where are Students from in the first D3 + React Cohort

Class homework: a horizontal bar chart of students enrolled, by country, color-coded by continent.

## Architecture (hard rule)
- **D3 does the math only.** React JSX renders everything (`<svg>`, `<rect>`, `<text>`, `<line>`, `<g>`).
- **Do not use** `d3.select`, `d3.append`, or any D3 DOM manipulation.
- D3 pieces allowed: `d3.scaleBand` (countries, Y), `d3.scaleLinear` (students, X), `d3.scaleOrdinal` (continent -> color), `d3.color(...).darker()` (hover shade).

## Data
- File: `src/data.js`, named export `data`.
- Row shape: `{ country, continent, students }`. 20 rows, 232 students total.
- Continent totals: Europe 117, North America 78, Asia 23, Oceania 10, South America 4.
- The chart component receives the array via a `data` prop (it does not import the data itself).

## Layout (top to bottom)
1. **Title (`<h1>`):** "Where are Students from in the first D3 + React Cohort"
2. **Controls row**, same width as the SVG (500px):
   - Left: sort toggle button group.
   - Right: continent legend (color swatch + name for each of the 5 continents).
3. **Chart:** one `<svg>` with `width=500` and `height=400`. Fixed size, not responsive (revisit if it is too tight).

## Chart
- Horizontal bars. Country names on the left, one bar per country.
- `scaleBand` on Y for countries (order follows the current sort); `scaleLinear` on X for students.
- **Value labels:** the student count at the end of each bar (`<text>`).
- **Value axis (bottom):** domain 0-75, ticks every 25 (0, 25, 50, 75), with faint vertical gridlines at each tick.
- Expect about 15px per bar; use small label text (10-11px) and a left margin of about 100px for country names.

## Sorting (React state, default "Descending")
Toggle button group with two options; the selected one is highlighted.
- **Descending** (default): by students, high to low.
- **By continent:** continents ordered by total students (Europe, North America, Asia, Oceania, South America); countries sorted descending within each continent.
- No ascending option. No animation when the sort changes.

## Color (Okabe-Ito, colorblind-safe)
| Continent | Base | Hover (darker) |
|---|---|---|
| Europe | `#0072B2` | `d3.color(base).darker()` |
| North America | `#E69F00` | same |
| Asia | `#009E73` | same |
| Oceania | `#CC79A7` | same |
| South America | `#D55E00` | same |

## Interaction
- **Hover:** only the hovered bar gets darker. Nothing else dims or changes.
- **Tooltip** (React state, shown on bar hover), two lines:
  ```
  United States 68 students
  87.2% of North America · 29.3% of all students
  ```
  - % of continent = country students / continent total.
  - % of all = country students / 232.
  - One decimal place.

## Out of scope
- Animated transitions, responsive sizing, dimming other bars, loading data from files or APIs.

## Open items
- Fixed 500x400 may feel cramped with 20 bars; tweak after seeing it.
