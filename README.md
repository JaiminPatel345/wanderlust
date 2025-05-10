# Wanderlust
 
 Wanderlust a hotel / property booking website 
 Watch [Live](https://wanderlust.jaimin-detroja.tech/)

---

## Technology  :
**Frontend**   :  
- Vite-React , Tailwind 

**Backend** :
- Node.js , Express.js 

**Database** :
- MongoDB 

**Authentication**  :
- Firebase 

**Session management**  :
- Redis 

**Package Manager** :
- yarn

**Deployment**  :
- [Vercel](https://wanderlust-ten.vercel.app/) (Frontend)
- [Azure](https://wanderlust-a9bffqcnaucneeat.eastus-01.azurewebsites.net/) (Backend)
- [MongoDB Atlas]() (Database)

**CI/CD tool** :
- Github Action

**Others** :
- REST APIs 
- Socket.io



# Wanderlust - Frontend

### Run code

```bash
yarn install
yarn dev
```

**Make sure you have .env file and it has those things**
```.env
VITE_API_BASE_URL=http://localhost:3000

CLOUDINARY_URL=

SECRET_KEY=ILoveCoding--ThisIsDemo
```


# Wanderlust: Backend

### Make you your .env file has those things

```.env
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
MONGO_URL=mongodb://localhost:27017/wanderlust 
REDIS_URL="redis-cli -h redis15.localnet.org -p 6390"
REDIS_PASS=
SECRET=AnyThingYouWant
```

### Running the Project

```bash
yarn install
```

### If you want to init default database then

```bash
node ./init/index.js
```

After the completion message, press CTRL + C and run this command:

```bash
yarn dev
```

