# demo-puppeteer
The basic demo to give the idea of using Puppeteer.

Steps:

- npm config set puppeteer_download_host=https://npm.taobao.org/mirrors
  - This is because by default some people are getting error for installing **puppeteer**
- npm install
- node index.js
  - This will generate a PDF named **temp.pdf** in the folder and the content is same that we have configured in **template.hbs**
