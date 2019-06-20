# 超级节点选举DApp前端

本DApp实现了VNT Chain Hubble Network超级节点选举的功能，用户可以通过此网站抵押、为候选人投票、代理他人投票等。

### 部署
#### 1. 生成build文件夹
需注意，第一次clone代码，需要先安装依赖
```js
  yarn 或者 yarn install 或者 npm install 
```
然后build项目
```js
  yarn build 或者 npm run build
```

#### 2. 删除map文件
```js
  rm build/static/js/*.map
```

#### 3. 将build之后的文件夹拷贝到服务器

```js
  scp -r <srcPath> <destPath>
```

#### 4. nginx配置
若是第一次部署页面到服务器，需要在`/etc/nginx/conf.d`目录下新增nginx配置，配置文件`vote_dapp.conf`如下:
```js
server {
  listen 80;
  server_name votes.vnt.link;  # 域名
  location / {
      root /home/centos/vote_front/build; # 对应destPath
      index index.html index.htm;
      proxy_redirect off;
      try_files $uri $uri/ /index.html;
  }
}
```
部署结束，重启nginx
```js
sudo nginx -s reload
```
部署成功后，通过上述设置的域名即可访问页面。