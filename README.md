<p align="center"><img src="https://adama-r.github.io/Projecta/assets/logo.svg" alt="" width="72" height="72"></p>

<h1 align="center">Projecta</h1>

<p align="center">Explorer des données et des images médicales · Explore data and medical images</p>

<p align="center">
<a href="https://github.com/Adama-R/Projecta/releases/latest"><b>Télécharger pour Windows</b></a> ·
<a href="https://projecta-dash.vercel.app"><b>Dans le navigateur</b></a> ·
<a href="https://adama-r.github.io/Projecta/"><b>Guide de l’utilisateur</b></a> ·
<a href="https://adama-r.github.io/Projecta/en/">User guide (English)</a>
</p>

![Le tableau de bord de Projecta : l’aperçu d’un jeu de données](https://adama-r.github.io/Projecta/assets/screenshots/apercu.png)

## Ce que fait Projecta

Chargez un fichier (CSV, Excel, Parquet, JSON, YAML), une table d’une base
(PostgreSQL, MySQL, SQLite) ou un examen d’imagerie (DICOM, NIfTI, PACS) :
Projecta le résume, le montre en 2D et en 3D (PCA, t-SNE, UMAP), le mesure
et l’exporte. Les examens sont anonymisés à l’ouverture. Un assistant
propose des réglages ; vous décidez. En français ou en anglais.

## Télécharger

Sur la page de la [dernière version](https://github.com/Adama-R/Projecta/releases/latest) :

| Fichier | Pour |
|---|---|
| `Projecta-Setup-X.Y.Z.exe` | installer l’application (Windows 10 et 11) ; elle se met à jour d’elle-même (**Aide › Rechercher des mises à jour…**) |
| `Projecta-X.Y.Z-portable.exe` | l’essayer sans l’installer |
| `SHA256SUMS.txt` | vérifier que le fichier téléchargé est intact |

L’application se connecte d’elle-même à **Projecta en ligne** : créez
votre compte au premier lancement, sans rien installer d’autre. N’y
envoyez que des
données de démonstration ou déjà anonymisées. Windows peut afficher
« Windows a protégé votre ordinateur » : l’application n’est pas encore
signée ; **Informations complémentaires › Exécuter quand même**.

Une fois installée, Projecta s’ajoute au menu **Ouvrir avec** de Windows
pour les tableaux (CSV, Excel, Parquet, JSON, YAML) et les examens (DICOM,
NIfTI, .zip).

Sans rien installer : le même tableau de bord, et le même compte, dans le
navigateur, sur <https://projecta-dash.vercel.app>.

## Le guide

<https://adama-r.github.io/Projecta/> : charger des données, explorer et
exporter, visualiser, l’imagerie médicale, l’assistant, l’application de
bureau. Chaque page a ses captures d’écran et un assistant qui répond à
partir du guide.

## Un problème, une idée

**Aide › Envoyer un avis…** dans l’application, ou une
[issue](https://github.com/Adama-R/Projecta/issues) ici.

---

## In English

Load a file, a database table or a medical imaging exam: Projecta
summarizes it, shows it in 2D and 3D, measures and exports it. Exams are
anonymized when they are opened.

- **Download for Windows**: [latest release](https://github.com/Adama-R/Projecta/releases/latest)
  (installer, portable version, SHA-256 checksums). It connects to Projecta
  online by itself: create your account on first launch; send it
  demonstration or anonymized data only.
- **In the browser**, nothing to install, the same account:
  <https://projecta-dash.vercel.app>.
- **User guide**: <https://adama-r.github.io/Projecta/en/>.
- **Feedback**: **Help › Send feedback…** in the application, or an
  [issue](https://github.com/Adama-R/Projecta/issues).

Gratuit à utiliser pour essayer Projecta, tous droits réservés : voir la
[licence](LICENSE). Le code source de Projecta est privé ; ce dépôt publie
l’application et le guide. · Free to use to try Projecta, all rights
reserved: see the [licence](LICENSE).
