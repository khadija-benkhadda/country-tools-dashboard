# Country Tools — provenance des données

## Résumé exact

Le projet utilise désormais un serveur Express/tRPC pour interroger des sources externes au moment de l’ouverture, du changement de paramètres et du clic sur Generate. Les données live sont demandées dans `client/src/pages/Home.tsx` via `trpc.live.*.useQuery()`, servies par `server/routers.ts`, puis récupérées dans `server/liveData.ts`.

Les interfaces **Trends**, **Address**, **Places** et **PDF & Book** utilisent des sources externes live. Les interfaces **Short Reply** et **Gmail Subject + Message** restent des générateurs de texte local : elles sont explicitement étiquetées comme contenu généré et ne sont pas présentées comme des données factuelles.

## Cartographie par interface

| Interface | Valeur affichée | Source réelle | Endpoint ou fonction | Statut |
|---|---|---|---|---|
| Trends Explorer | Mots-clés actuellement populaires | Google Trends Trending RSS | `https://trends.google.com/trending/rss?geo=CODE`, `fetchTrends()` dans `server/liveData.ts` | Live |
| Address Generator | Adresses retournées par une recherche de lieux | Google Maps Places Text Search via le proxy serveur Manus | `/maps/api/place/textsearch/json`, `makeRequest()` puis `fetchAddresses()` | Live, résultats Places contenant une adresse |
| Places Explorer | Nom, adresse et catégorie d’un lieu | Google Maps Places Text Search via le proxy serveur Manus | `/maps/api/place/textsearch/json`, `makeRequest()` puis `fetchPlaces()` | Live |
| PDF & Book Finder | Titres, auteurs, années et requêtes PDF | Open Library Search API | `https://openlibrary.org/search.json`, `fetchDocuments()` | Live bibliographique |
| Short Reply Generator | Réponses courtes | Tableaux et combinaisons locales | `replyParts`, `replyDistinctifiers` et `generateReplyNow()` dans `Home.tsx` | Généré, non factuel |
| Gmail Subject + Message | Paires Subject/Message | Thèmes et phrases locales | `generateEmailPairs()` dans `client/src/lib/generators.ts` | Généré, non factuel |

## Provenance pays et filtres

Les noms et codes pays restent dans `countryProfiles` de `client/src/lib/countryData.ts`. Ce référentiel sert à convertir la sélection de l’utilisateur en paramètres d’API ; il ne constitue pas les résultats live eux-mêmes. Les sélections sont conservées dans `localStorage` par les effets de `Home.tsx`.

Les filtres sont des paramètres React transmis aux procédures tRPC. Les requêtes live utilisent `refetchOnMount: "always"`, afin de demander des données au montage de chaque page plutôt que de réutiliser silencieusement un résultat précédent.

## Métadonnées de provenance

Chaque adaptateur live renvoie `source`, `endpoint`, `fetchedAt` et `mode: "live"`. Le service de texte renvoie `mode: "generated"`. Les notices colorées affichent le nom de la source et l’heure de récupération. Le test `server/liveData.test.ts` vérifie cette distinction.

## Limites honnêtes

Une API réelle ne garantit pas 1 000 à 10 000 résultats pour une requête. Google Places limite les résultats par recherche et Open Library demande d’éviter le téléchargement massif. Les contrôles live sont donc limités à 100 résultats par appel au lieu de compléter artificiellement la collection avec des doublons ou des lignes synthétiques.

Le flux Google Trends utilisé est le flux Trending RSS public. L’API Google Trends officielle est documentée comme une API Alpha à accès limité ; elle n’est donc pas présentée comme une API publique générale. Pour les adresses, l’outil affiche des adresses réelles renvoyées par la recherche Google Places, mais ne prétend pas constituer un registre exhaustif d’adresses postales.

## Fichiers à consulter

| Fichier | Rôle |
|---|---|
| `client/src/pages/Home.tsx` | États, appels tRPC, rafraîchissement, rendu et notices de provenance |
| `server/routers.ts` | Procédures `live.trends`, `live.addresses`, `live.places`, `live.documents` et `live.textSource` |
| `server/liveData.ts` | Appels HTTP externes, transformation des réponses et métadonnées |
| `server/_core/map.ts` | Proxy authentifié du service Google Maps fourni par l’environnement |
| `client/src/lib/generators.ts` | Générateurs locaux conservés pour Replies et Gmail |
| `client/src/lib/countryData.ts` | Référentiel statique des profils pays |
| `server/liveData.test.ts` | Tests de provenance live/généré |

## Références officielles

[1]: https://developers.google.com/search/apis/trends "Google Trends API alpha"
[2]: https://developers.google.com/search/blog/2025/07/trends-api "Introducing the Google Trends API (alpha)"
[3]: https://openlibrary.org/developers/api "Open Library APIs"
[4]: https://developers.google.com/maps/documentation/places/web-service/overview "Google Places API overview"
