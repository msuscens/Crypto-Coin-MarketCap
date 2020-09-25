Crypto-Coin-MarketCap

My Coin Marketcap inspired project (Blockchain Developer Bootcamp Week 5).

Note: Requires local server to be running, eg. in terminal window:
  cd to code directory, and then
  python3 -m http.server
  (Or run from VS Code using LiveServer)


The webpage will display coin price details, market cap etc by making Coingeko API calls to obtain the relevant data.


Implementation Notes:
1. - The sorting capability on the coin table columns will function on columns containing either numeric or string data.  To add the same sorting functionality to further coin table columns:
  i. Add the event handler to relevant column header (ie. in html <th> tag): onclick="sortTableRows(event)"
  ii. Add that column's coin data attribute into the switch statement, within function getCoinObjectAttribute(IdElement); that is in logic.js

    Note: The sort functionality operates on previously obtained coin data (held as an array of objects) that is already displayed in the table (ie. it doesn't obtain the latest/updated data via a new api call but rather sorts the currently held data).
