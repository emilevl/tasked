# Tasked
Tasked est une api créée dans le cadre du cours "Architecture orienté Web" à la HEIG-VD.
Le projet a pour but de réaliser une application de gestion des heures dans une entreprise.
Dans ce projet se trouveront trois collections principales: 
- Users
- Projects
- Tasks

## Contexte
Pour la réalisation de cette première version, nous voyons l'api comme si elle allait être utilisée par une seule entreprise. 
Il y a un champ "company" dans le projet, mais elle n'est pas utile pour le moment. Elle serait utile dans une version ultérieure où chaque entreprise pourrait utiliser cette application.

Ainsi, chaque utilisateur pourra créer une tâche dans un projet spécifié. Cette tâche aura une date et heure de début par défaut (celle de la création de la tâche). Lorsqu'ils finissent leur tâche, ils n'ont qu'à indiquer à l'api que la tâche est finie (/tasks/end/{idTask}) afin qu'une date et heure soit ajoutée à la tâche. 

# Requis
- [Node.js](https://nodejs.org/en/) 14.x
- [MongoDB](mongodb.com) 4.x

# Usage
```bash
# Clone the application
git clone https://github.com/emilevl/tasked.git

# Install dependencies
cd tasked/
npm install

# Start the application
npm run dev

# 2nd Option if npm run dev doesn't work
DEBUG=* nodemon
```
Une fois la commande lancée, le serveur est accessible à http://localhost:3000/.

## Gestion des comptes
Pour créer un compte admin, il faut:
1. Se créer un compte utilisateur via http://localhost:3000/users/register
2. Se connecter à ce compte via http://localhost:3000/auth/login
3. *Dans le code*: 
  - Aller dans le fichier [routes/users.js](routes/users.js)
  - Dans la partie "post("/")", enlever la partie limitation aux admin pour la création de compte
  ```javascript
  usersRouter.post('/', authenticate, function(req, res, next) {
  // Remove temporarily this code to create an admin user.
  // Only admins can create a user
  const authorized = req.role.includes("admin");
    if (!authorized) {
      return res.status(403).send("Please mind your own things.")
    }
    // ...
  ```
  - Créer le compte admin puis remettre le code.

# Configuration
Vous aurez besoin d'un fichier [dotenv](https://www.npmjs.com/package/dotenv) (.env). Celui-ci est dans le gitignore et ne doit surtout pas être dévoilé !

Il faudra donc configurer dans le fichier dotenv les éléments suivants: 
- `PORT=3000`
- `TASKED_SECRET_KEY`
- `DATABASE_URL = mongodb://127.0.0.1/tasked` 
- `SERVER_URL`

# Tests automatisés
Cette application a des tests automatisés qui peuvent être lancés avec la commande `npm test`.
Il se connectera à la base de donnée `mongodb://127.0.0.1/tasked-test`.

> Les tests ne couvrent actuellement pas la totalité des fichiers.

# Websocket
Le websocket est mis en place.
Pour se connecter, il suffit de se connecter via Postman avec ce lien: ws://localhost:3000/

Lorsqu'un nouveau projet est créé, un message est envoyé en broadcast, dans le format suivant:
```json
{
    "message": {
        "event": "projectCreated",
        "name": "Trial",
        "data": ""
    }
}
```

