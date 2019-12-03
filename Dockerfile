FROM node:12-alpine

# Copy package.json and install
COPY package.json ./
RUN yarn

# Copy logic
COPY . .

ENTRYPOINT [ "node","/index.js" ]