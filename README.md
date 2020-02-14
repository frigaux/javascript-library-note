# Librairie javascript pour annoter

**Navigation**

[TOCM]

## Présentation
Il s'agit d'une librairie légère écrite en javascript qui n'utilise pas de dépendance.

Prenons un bout de code COBOL dont nous souhaitons détailler le fonctionnement pour un néophyte :
cette librairie va nous permettre d'ajouter des notes sur des portions de code qui s'afficheront selon une timeline. 

## Utilisation
### Ajout de la librairie dans la page HTML
`<script type="text/javascript" src="js/note.js"></script>`

### Décoration du HTML
Partons d'un programme COBOL dans une balise `<PRE>`, il va s'agir de décorer les bouts de code avec une balise `<SPAN>` et l'attribut `data-note`.
Prenons l'exemple suivant :
 
`<span data-note='{"htmlContent": "Division correspondant à l&apos;entête", "startTime": 5000, "runningTime": 10000}'>IDENTIFICATION DIVISION</span>`

L'attribut `data-note` contient du JSON dont voici le détail des clés :

| Clé  | Type  | Description |
| :--- | :--- | :--- |
| startTime      | number | temps démarrage en ms |
| runningTime      | number        | durée d'exécution en ms |
| htmlContent | string        | contenu HTML de la note (avec entités HTML) |