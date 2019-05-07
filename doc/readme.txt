# make sure "npm login" first
npm version patch
npm publish --access=public

# local test
npm pack
npm install D:\Codes\linkfuture\LinkFuture.Boot\linkfuture-boot-0.0.22.tgz


# How to generate JWT RS256 key
ssh-keygen -t rsa -b 4096 -f jwtRS256.key
# Don't add passphrase
openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
cat jwtRS256.key
cat jwtRS256.key.pub

https://shields.io/

>#### Redis client
https://app.redislabs.com