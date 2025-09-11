## listebird

### what & why

listebird is a cli tool for scraping your life list from ebird. ebird has an api, but the api appears to be so focused on research value & ebird's historical data that it does not include the user's life list!

### a note

this is not entirely intended use of ebird's single sign-on infrastructure. please be considerate of ebird's resources while using this utility.

### how (for users)

- install listebird with `npm install --global listebird`
- run `listebird --username 'myusername' --password 'mypassword'`. you can also provide these arguments as environment variables (e.g., `LISTEBIRD_USERNAME='myusername' LISTEBIRD_PASSWORD='mypassword' listebird`).
  - note: you can produce text tables instead of JSON output with the flag `--format='text'` or env variable `LISTEBIRD_FORMAT='text'`.

### how (to pronounce)

like "list ebird", as in, "give me that life _list, ebird_".

### how (for implementors)

listebird works by reverse-engineering the single sign-on browser workflow and replicating it using a series of fetch requests.
