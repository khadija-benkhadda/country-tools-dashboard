# Audit des sources live — migration Country Tools

## Google Trends

La documentation officielle Google indique qu’une API Google Trends existe en alpha, mais l’accès est limité à un nombre très restreint de testeurs et nécessite une candidature. Elle fournit des données d’intérêt de recherche sur une fenêtre glissante d’environ cinq ans, avec agrégations quotidiennes, hebdomadaires, mensuelles et annuelles, ainsi que des données par pays et sous-régions.

Source officielle : [Google Trends API alpha](https://developers.google.com/search/apis/trends)

Annonce officielle : [Introducing the Google Trends API (alpha)](https://developers.google.com/search/blog/2025/07/trends-api)

Conséquence d’architecture : l’application ne peut pas promettre une connexion Google Trends officielle universelle sans accès alpha ou fournisseur tiers autorisé. Il faut prévoir un adaptateur côté serveur et afficher clairement l’état de la source. Les URLs Google Trends actuelles restent des liens de validation, pas une extraction de données.

## Connecteurs disponibles dans la session

L’audit de configuration montre plusieurs connecteurs API désactivés, notamment Trendtrack, Ubersuggest, Yelp API et TomTom Maps. Aucun ne doit être activé ou utilisé sans vérifier ses conditions, son accès et les credentials requis.
