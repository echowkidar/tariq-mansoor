FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY server.js ./
COPY public ./public
RUN mkdir -p /app/data
VOLUME ["/app/data"]
ENV NODE_ENV=production
ENV PORT=3000
ENV DOMAIN=test.tariqmansoor.com
EXPOSE 3000
CMD ["npm", "start"]
