# $403

Flat static site. No build step. No subdirectories.

## GitHub Pages

1. Create a repository.
2. Upload every file in this folder to the repository root. Do not put them in a subfolder.
3. Settings → Pages → Deploy from branch → `main` → `/ (root)` → Save.
4. Open `https://YOURNAME.github.io/REPO/`.

`index.html` is the entry. On load it shows an Apache/Ubuntu 403, then the page corrupts and reveals the lore site.

`ca.txt` is the contract file. Put the mint on its own line under the comments. The page reads that file, makes the address click-to-copy, and loads the DexScreener chart. Until a real address is there, the chart stays hidden.


Click the forbidden page to break it early.
