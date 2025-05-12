FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY ./dist/sudoku-app/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]