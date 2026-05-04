# 🚀 E-Commerce Microservices Architecture (NestJS)

Ce projet implémente une architecture complète basée sur les microservices pour simuler un système de commerce électronique. Il est construit avec le framework **NestJS** et utilise différentes méthodes de communication (REST, gRPC, Kafka, GraphQL) adaptées aux besoins spécifiques de chaque service.

## 🏗️ Architecture du Projet

L'application est découpée en 5 microservices indépendants :

1. **📦 Catalog Service (REST - Port 3000)** : Gère le catalogue des produits (Création, lecture, mise à jour, suppression).
2. **🛒 Order Service (REST - Port 3002)** : Gère la création des commandes clients. Lors d'une commande, il communique en temps réel avec le *Stock Service* via gRPC pour valider la disponibilité.
3. **🏭 Stock Service (gRPC - Port 50051)** : Service ultra-rapide qui vérifie et décrémente les stocks des produits. S'il n'y a pas assez de stock, la commande est refusée.
4. **📧 Notification Service (Kafka)** : Écoute les événements de validation publiés par l'*Order Service* de manière asynchrone pour simuler l'envoi d'e-mails de confirmation de commande, évitant ainsi de ralentir le processus de paiement.
5. **📊 Query Service (GraphQL - Port 3003)** : Fournit un point d'accès unifié (GraphQL) permettant d'interroger la liste des produits et des commandes via une seule requête, jouant le rôle de Dashboard.

## 🛠️ Technologies Utilisées

- **Framework Backend :** NestJS (TypeScript)
- **Base de données :** SQLite (via TypeORM)
- **Communications Synchrones :** API REST & gRPC
- **Communication Asynchrone :** Apache Kafka (Event-Driven Architecture)
- **API d'Agrégation :** GraphQL (Apollo Server)
- **Infrastructure :** Docker & Docker Compose (Zookeeper & Kafka)

---

## 🚀 Comment lancer le projet ?

### 1. Démarrer l'infrastructure (Docker)
Assurez-vous que Docker Desktop est ouvert, puis lancez Kafka et Zookeeper depuis la racine du projet :
```bash
docker-compose up -d
```

### 2. Démarrer les Microservices
Ouvrez **5 terminaux distincts** et lancez chaque service dans son propre environnement de développement :
```bash
# Terminal 1
cd catalog-service && npm run start:dev

# Terminal 2
cd order-service && npm run start:dev

# Terminal 3
cd stock-service && npm run start:dev

# Terminal 4
cd notification-service && npm run start:dev

# Terminal 5
cd query-service && npm run start:dev
```

---

## 🧪 Comment tester le projet ? (Scénario de Validation)

Une fois tous les services en cours d'exécution, vous pouvez dérouler le scénario de test complet pour vérifier la communication inter-services :

### Étape 1 : Créer des produits (Catalog Service)
Effectuez une requête POST vers le **Catalog Service** :
```bash
curl -X POST http://localhost:3000/products \
     -H "Content-Type: application/json" \
     -d "{\"name\":\"PC Gamer\",\"price\":1200,\"stock\":5}"
```

### Étape 2 : Passer une commande valide (Order, Stock & Kafka)
Effectuez une requête POST vers l'**Order Service**. Ce dernier appellera le *Stock Service* (gRPC) et publiera un message sur *Kafka*.
```bash
curl -X POST http://localhost:3002/orders \
     -H "Content-Type: application/json" \
     -d "{\"productId\":1,\"quantity\":2,\"customerEmail\":\"jean@dupont.com\"}"
```
*Vérification : Le Terminal 4 (Notification) affichera automatiquement un log confirmant la réception de l'événement Kafka.*

### Étape 3 : Tester une commande sans stock (Validation gRPC)
Testez le blocage gRPC en commandant plus de produits qu'il n'y en a en stock (ex: quantité de 10) :
```bash
curl -X POST http://localhost:3002/orders \
     -H "Content-Type: application/json" \
     -d "{\"productId\":1,\"quantity\":10,\"customerEmail\":\"jean@dupont.com\"}"
```
*Vérification : Vous recevrez un Code HTTP 500 - "Stock insuffisant".*

### Étape 4 : Interroger les données (GraphQL)
Ouvrez votre navigateur sur [http://localhost:3003/graphql](http://localhost:3003/graphql) et exécutez la requête suivante pour récupérer vos données depuis le Dashboard :
```graphql
query {
  products { id name price stock }
  orders { id productId quantity status customerEmail }
}
```
