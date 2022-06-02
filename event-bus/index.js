import  express from "express";
import bodyParser from 'body-parser';
import axios from "axios";

const app = express();
app.use(bodyParser.json());

const events = [];

app.get('/events', (req, res) => {
  res.send(events);
});

app.post('/events', (req, res) => {
  const event = req.body;
  console.log('Received: ', event);

  events.push(event);

  axios.post('http://posts-srv:4000/events', event).catch(err => {
    console.log(err.message);
  });
  axios.post('http://comments-srv:4001/events', event).catch(err => {
    console.log(err.message);
  });
  axios.post('http://query-srv:4002/events', event).catch(err => {
    console.log(err.message);
  });
  axios.post('http://moderation-srv:4003/events', event).catch(err => {
    console.log(err.message);
  });

  res.send({status: 'OK'});
});

app.listen(5000, () =>{
  console.log('Listening on port 5000');
});
