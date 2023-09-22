FROM node:18
WORKDIR /usr/app
EXPOSE 3004
COPY ./ ./
RUN npm install
CMD ["npm", "start"]