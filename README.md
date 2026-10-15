# V.C. Tips

Οδηγός στησίματος Video Check: βήματα με εικόνες, tips και γήπεδα με αρκτικόλεξα και οδηγίες Google Maps.

**Εφαρμογή:** https://tsimpinosbv.github.io/vctips/

- Εγκαθίσταται στο κινητό ως ξεχωριστή εφαρμογή (κουμπί 📲 Εγκατάσταση, ή στο iPhone: Safari → Κοινοποίηση → Προσθήκη στην οικία).
- Είσοδος με τον λογαριασμό του Check Mate (Google ή email). Η εφαρμογή δεν δημιουργεί λογαριασμούς και δεν γράφει τίποτα στο Check Mate.
- Το περιεχόμενο το βλέπουν όσοι συνδεθούν. Το αλλάζουν οι διαχειριστές του Check Mate, από το **✎ Επεξεργασία**.
- Δουλεύει και χωρίς σύνδεση, με ό,τι έχει ήδη ανοιχτεί στη συσκευή.

## Αρχεία

| Αρχείο | Τι είναι |
|---|---|
| `index.html` | Η σελίδα και η εμφάνιση |
| `app.js` | Στήσιμο, Tips, Γήπεδα, επεξεργασία |
| `auth.js` | Είσοδος, έλεγχος διαχειριστή, εγκατάσταση |
| `firebase-config.js` | Στοιχεία του έργου Firebase (το ίδιο με του Check Mate) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Εγκατάσταση σαν εφαρμογή |
| `img/videocheck-layout.jpg` | Η διάταξη VideoCheck του 1ου βήματος |

## Βάση δεδομένων

Το περιεχόμενο είναι στο ίδιο έργο Firebase με το Check Mate (`checkmate-33472`), σε δικές του συλλογές:
`vct_steps`, `vct_tips`, `vct_venues`.

Οι διαχειριστές του Check Mate γράφουν σε αυτές ήδη από τον κανόνα των διαχειριστών. Για να τις **διαβάζουν** και οι χρήστες,
στους κανόνες του Firestore (Firebase console → Firestore → Rules) χρειάζονται αυτές οι τρεις γραμμές, μέσα στο
`match /databases/{database}/documents { ... }`:

```
    // V.C. Tips (github.com/tsimpinosbv/vctips): signed-in users read; Check Mate admins write (admin rule above).
    match /vct_steps/{doc}  { allow read: if signedIn(); }
    match /vct_tips/{doc}   { allow read: if signedIn(); }
    match /vct_venues/{doc} { allow read: if signedIn(); }
```

Αν κάποτε αντικατασταθούν οι κανόνες με το `firestore.rules` του Check Mate, αυτές οι γραμμές πρέπει να ξαναμπούν.

## Αλλαγές στον κώδικα

Δεν υπάρχει build. Αλλάζεις τα αρχεία και το GitHub Pages τα δημοσιεύει σε λίγα λεπτά.
Όταν αλλάζει κάτι από τα αρχεία του `sw.js`, ανέβασε τον αριθμό στο `CACHE` (π.χ. `vctips-v2`).
