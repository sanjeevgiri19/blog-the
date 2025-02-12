FROM node:19-alpine

# setting working directory inside container
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./


RUN npm install

# copy rest of application
COPY . .

# if i have created inside src folder then
# COPY ./src ./src
# COPY ./env ./
# and so on ...

# port that my app runs on
EXPOSE 8000

# this is basically the command to run the app
CMD [ "node", "index.js" ]   
