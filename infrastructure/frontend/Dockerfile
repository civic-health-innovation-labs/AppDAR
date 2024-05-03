FROM node:lts-alpine

# install simple http server for serving static content
RUN npm install -g http-server

# make the 'app' folder the current working directory
WORKDIR /app

# copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# install project dependencies
RUN npm install jquery --save
RUN npm i --save-dev @types/jquery
RUN npm i @azure/msal-browser  @azure/msal-react
RUN npm i react-router-dom
RUN npm install

EXPOSE 3000
