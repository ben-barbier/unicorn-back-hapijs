# unicorn-back

Run project with Docker :

```
git clone https://github.com/ben-barbier/unicorn-back
cd unicorn-back
docker build -t unicorn-back . 
docker run -p 3000:3000 -p 3100:3100 unicorn-back
```

Run project without Docker :

```
git clone https://github.com/ben-barbier/unicorn-back
cd unicorn-back
npm install 
npm run build
npm start -- --host 127.0.0.1
```
