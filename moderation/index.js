import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
app.use(bodyParser.json());

app.post('/events', async (req, res) => {
  const { type, data } = req.body;
  if (type === 'CommentCreated') {
    const status = data.content.toLowerCase().includes('orange') ? 'rejected' : 'approved';
    await axios.post(
      'http://event-bus-srv:5000/events',
      {
        type: 'CommentModerated',
        data: {
          id: data.id,
          postId: data.postId,
          status,
          content: data.content,
        }
      }
    ).catch(err => {
      console.log(err.message);
    });
  }

  res.send({status: 'OK'});
});

app.listen(4003, () => {
  console.log("Listening on port 4003");
});
