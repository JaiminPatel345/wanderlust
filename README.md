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
- [Vercel](https://wanderlust.jaimin-detroja.tech/) (Frontend)
- [Azure]() (Backend)
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

SECRET_KEY=ILoveCoding--ThisIsDemo
```


# Wanderlust: Backend

### Make you your .env file has those things

```bash
REACT_APP_API_URL=http://localhost:5173

CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=

MONGO_URL=mongodb://localhost:27017/wanderlust
 
REDIS_URL="redis-cli -h redis15.localnet.org -p 6390"
REDIS_PASS=

SECRET=AnyThingYouWant
JWT_SECRET=AnyThingYouWant2
RESET_PASSWORD_SECRET=AnyThingYouWant3

NODEMAIL_EMAIL=your-email@ok.com
NODEMAIL_PASS=your-app-password #go to google setting you will get from there 

IS_SAVE_COOKIES=true
SAME_SITE="None" # you can change
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

