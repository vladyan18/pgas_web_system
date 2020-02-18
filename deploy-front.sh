cd client &&
npm run build &&
cd .. &&
cp -r ./client/build/* ./nginx/build/ &&
sudo docker-compose build nginx &&
sudo docker-compose up -d
