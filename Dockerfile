FROM node:20-alpine
LABEL "com.github.actions.name"="action-auto-reviews-from-branches"
LABEL "com.github.actions.description"="Review automatic `pull request` from selected branches or author."
LABEL "com.github.actions.icon"="user-check"
LABEL "com.github.actions.color"="red"
LABEL "repository"="https://github.com/datreeio/action-auto-reviews-from-branches"
LABEL "maintainer"="Patawee Boonsongsri <psgolf16@gmail.com>"
# Copy package.json and install
COPY package.json ./
RUN yarn

# Copy logic
COPY . .

ENTRYPOINT [ "node","/index.js" ]
