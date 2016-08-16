const express = require('express');
const bodyParser = require('body-parser');
const OAuth = require('oauth').OAuth;
const _ = require('lodash');
const Trello = require('node-trello');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const key = 'f601589cd3b1b3afc2a06a04277ecc58';
const secret = 'ac760dabba9fcf2f3576c614c05b57c061a64c2d1142b10fa984c5488debc2da';

const requestURL = 'https://trello.com/1/OAuthGetRequestToken';
const accessURL = 'https://trello.com/1/OAuthGetAccessToken';
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken';

const appName = 'SAE App';

const loginCallbackURL = 'http://localhost:3010/trello/callback';

const accessToken = 'd4baf3961825a5d87bccfdf56fa81b85ff56cca4f811dbfd33f9d6e42196416a';
const t = new Trello(key, accessToken);

const oa = new OAuth(
  requestURL,
  accessURL,
  key,
  secret,
  '1.0',
  loginCallbackURL,
  'HMAC-SHA1'
);

let tokenSecret;

app.get('/trello/login', (req, res)=>{

  //res.send('HEllo login');

  oa.getOAuthRequestToken((err, token, _tokenSecret, results)=>{

    console.log('Token: ', token);
    console.log('Token secret: ', _tokenSecret);
    tokenSecret = _tokenSecret;

    res.writeHead(302, {'Location':`${authorizeURL}?expiration=never&oauth_token=${token}&name=${appName}&scope=read,write,account`});
    res.end();

  });

});


app.get('/trello/boards', (req, res)=>{

  t.get('/1/members/me/boards', (err, boardsArray)=>{

    // console.log(data);
    // res.send(data);

    const board = _.find(boardsArray, {name:'SAE Test'});

    t.get(`/1/boards/${board.id}/lists`, (err, listsArray)=>{


      const list = _.find(listsArray, {name:'Backlog'});

      t.post(`/1/cards`, { idList:list.id, due:null, name:'Hello trello 3', desc:'Hello trello 3 description' }, (err, cardRes)=>{

        res.send(cardRes);

      });

    });


  });

});

app.get('/trello/boards/filter/:key', (req, res)=>{

  t.get('/1/members/me/boards?filter='+req.params.key, (err, data)=>{

    console.log(data);
    res.send(data);

  });

});

app.get('/trello/callback', (req, res)=>{

  console.log('Callback happened!');
  console.log(req.query);

  var oauth_token = req.query.oauth_token;
  var oauth_verifier = req.query.oauth_verifier;

  oa.getOAuthAccessToken(oauth_token, tokenSecret, oauth_verifier, (err, accessToken, accessTokenSecret, results)=>{

    console.log(accessToken);

  });

});

app.listen(3010, ()=>{

  console.log('All is well');

});