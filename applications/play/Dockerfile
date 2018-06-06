FROM node:8@sha256:f10c8218e3f92b513af9120f5eda5fed35b651343f940881d696b958cc16ab43
ADD . /playground
WORKDIR /playground
RUN npm install && npm run build

EXPOSE 3000

CMD ["/playground/node_modules/.bin/next", "start", "--host", "0.0.0.0"]
