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
