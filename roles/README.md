# Roles

Using docker-compose and the docker containers
described in this roles folder, you can create
a development environment that's consistent
across developer machines:

```sh
docker-machine create --driver virtualbox oauth
docker-machine stop oauth
VBoxManage modifyvm "oauth" --natpf1 "tcp-port5432,tcp,,5432,,5432"
docker-machine start oauth
docker-compose build
docker-compose up -d
docker exec -it oauth2serverpg_postgres_1 psql "dbname=oauth2_server user=postgres host=0.0.0.0 port=5432"
```
