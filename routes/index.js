var express = require('express');
var router = express.Router();
const request = require('request');
const querystring = require('querystring');


const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

// Handles messages events
function handleMessage(sender_psid, received_message) {
  let response;

  // Check if the message contains text
  if (received_message.text) {    

    // Create the payload for a basic text message
    response = {
      "text": `You sent the message: "${received_message.text}". Now send me an image!`
    }
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);   
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {

}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {

   const data = JSON.stringify({
    recipient: {
      id: sender_psid
    },
    message: {
      text: response
    }
  })

  options = {
    hostname: 'graph.facebook.com',
    port: 443,
    path: '/v6.0/me/messages?access_token=EAADBEn1YIlIBADFZAjAZCof9vX3EMtDSxaZBnHOsvPTS0tDSdmfHuHIuN2K3SkBmmhdZCnvqZCDE9BU9Jq5Dx6ZC0MoRGlyiMEKlyR9ZCVhFoqq3fMcFZA7y5ZA352rZCaohTGfZA3b7VvL023N3rOvpMTxVWKDotcnmLrOGed47hhNfQZDZD',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }

  const yolo = https.request(options, res => {
    console.log(`statusCode: ${res.statusCode}`)

    res.on('data', d => {
      console.log(d)
      process.stdout.write(d)
    })
  })

  yolo.on('error', error => {
    console.error(error)
  })

  yolo.write(data)
  yolo.end()

}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Creates the endpoint for our webhook 
router.post('/webhook', function(req, res, next) {  
 
  let body = req.body;

  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Gets the message. entry.messaging is an array, but 
      // will only ever contain one message, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }

    });

    // Returns a '200 OK' response to all requests
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Adds support for GET requests to our webhook
router.get('/webhook', function(req, res, next) {  

  // Your verify token. Should be a random string.
  let VERIFY_TOKEN = process.env.VERIFY_TOKEN
    
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
  
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});


module.exports = router;
