# Een Warme Thuis

Een kleine retro-browsergame over omkijken naar elkaar.
Gemaakt voor de les godsdienst, rond **De Warmste Week**.

Je speelt een klein, onzichtbaar vlammetje. Je kunt geen wonderen doen,
maar je kunt mensen wel helpen om elkaar op te merken.

## Spelen

**Op je eigen computer:** dubbelklik op `index.html`. Je hebt geen internet of installatie nodig.
Laat alle bestanden en mappen (`css/`, `js/`, `img/`) samen in dezelfde map staan.

**Besturing**

| Toets | Wat het doet |
|---|---|
| Pijltjes of WASD | Rondlopen (letters werken zowel op AZERTY als op QWERTY: de toets waar Z op staat, is altijd Z) |
| Z, spatie of enter | Onderzoeken, tekst doorklikken, actie uitvoeren |
| X of SHIFT | Tekst sneller laten verschijnen |
| R of ESC | Hoofdstuk opnieuw beginnen |
| M | Geluid aan/uit |
| F | **Feedback**: pauzeert het spel, typ een opmerking (er wordt automatisch vastgelegd wat er op dat moment gebeurde). Met "Kopieer alles als prompt" kopieer je alle notities in één keer, of bewaar ze met "Download als bestand". Notities blijven in de browser bewaard, ook als je het venster sluit zonder op Opslaan te drukken. |
| Muisklik / tikken | Er zitten **12 verborgen verrassingen** in de achtergronden. Klik op dingen, of bekijk iets een tweede keer... |
| ` (backtick) | **Dev-menu**: naar een hoofdstuk springen, alle aanwijzingen geven, einde kiezen, botsingsvakken tonen |

In het hoofdmenu staat **Over ons**. Wie op het titelscherm boven *Nieuw spel* nog één keer omhoog drukt
(of op het vlammetje klikt), vindt een geheim lijstje met alle verrassingen.

**Snel naar een hoofdstuk (voor testen):** zet `#h1` t/m `#h9` achter het adres, bv. `index.html#h5`.
`#warm`, `#lauw` en `#koud` tonen meteen een einde.

Op een gsm of tablet verschijnen er knoppen op het scherm.

## Online zetten met GitHub Pages (gratis)

1. Maak een account op [github.com](https://github.com) en klik op **New repository**.
   Geef het een naam, bijvoorbeeld `warmethuis`, kies **Public** en klik **Create repository**.
2. Klik op **uploading an existing file** en sleep **alle** bestanden en mappen uit deze map
   (`index.html`, `css`, `js`, `img`, `README.md`, `.nojekyll`) in het venster. Klik **Commit changes**.
3. Ga naar **Settings → Pages**. Kies bij *Source* **Deploy from a branch**,
   kies branch **main** en map **/ (root)**, en klik **Save**.
4. Na een minuutje staat je spel online op
   `https://JOUW-GEBRUIKERSNAAM.github.io/warmethuis/`

## Hoe het in elkaar zit

| Bestand | Inhoud |
|---|---|
| `index.html` | De pagina met het speelveld |
| `css/style.css` | Opmaak en schermknoppen voor gsm |
| `js/engine.js` | Tekenen, toetsen, geluid, dialoogvensters |
| `js/sprites.js` | Personages, katje en het vlammetje |
| `js/decor.js` | Kamers, deuren, meubels, gevels |
| `js/closeups.js` | De ingezoomde momenten (gezichten, details) |
| `js/common.js` | Personages laten lopen, zitten, binnengaan |
| `js/l1.js` … `js/l9.js` | De negen hoofdstukken |
| `js/eggs.js` | De verborgen verrassingen (muisje, mot, eekhoorn, hinkelpad, ...) |
| `js/endings.js` | De drie eindes |
| `js/feedback.js` | Het feedbackvenster (F) |
| `js/about.js` | De tekst van **Over ons** in het hoofdmenu |
| `js/main.js` | Spelverloop, titelscherm, verrassingenlijst, dev-menu |
| `img/dww-logo.png` | Het logo van De Warmste Week (gebruikt met toestemming; `dww-logo.svg` is het origineel) |

De tekst van **Over ons** schrijf je in `js/about.js`.

Tekst aanpassen? Alle dialogen staan als gewone zinnen in de bestanden `js/l1.js` t/m `js/l9.js`.
Open ze met Kladblok of een andere teksteditor en pas de zinnen tussen de aanhalingstekens aan.
