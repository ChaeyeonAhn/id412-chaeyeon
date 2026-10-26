# S&P 500 Line

Twenty years of S&P 500 daily closes (2006–2026) as one plain line, nothing added. Hover to read a day's date and close.

- Route: /experiments/w1/sp500-line
- Week: W1 · Tech: Canvas
- Inputs: mouse x (date readout)
- Parameters: none; the data as it is (linear scale, one point per trading day)

## How it works
- `sp500.csv` (date, close, volume; Yahoo Finance ^GSPC) is fetched once.
- x is the trading day index, y is the close on a linear scale between the 20-year min and max.
- Each frame redraws the line, the two mono labels, and, if the mouse is over the chart, a hairline with a dot and readout for the nearest day.
- Colours come from `tokens.ts` (cheney design system): teal 600 line on white, CSS film grain overlay.
- A plain take on `sp500-threads`, which turns the same data into fraying threads.

## Run
pnpm dev → http://localhost:3000/experiments/w1/sp500-line

## Status / next
Works. Data stops at 2026-10-23. Next: a log-scale toggle, or start building visual layers on top of this line again.
