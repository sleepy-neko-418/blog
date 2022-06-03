import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {}

const handleEvent = (type, data) => {
  let resStatus, resPayload;

  if (type === 'PostCreated') {
    const { id, title } = data;

    if (posts.hasOwnProperty(id)) {
      res.status(400).send({error: 'Post already exist'});
    }
    posts[id] = { id, title, comments: [] };

    resStatus = 201;
    resPayload = posts[id];
  }

  if (type === 'CommentCreated') {
    const { id, content, postId, status } = data

    if (!posts.hasOwnProperty(postId)) {
      resStatus = 400;
      resPayload = { error: 'Post not exist' }
    }
    if (posts[postId].comments.hasOwnProperty(id)) {
      resStatus = 400;
      resPayload = { error: 'Comment already exist' };
    }

    posts[postId].comments.push({ id, content, status });

    resStatus = 200;
    resPayload = { status: 'OK' };
  }

  if (type === 'CommentUpdated') {
    const { id, content, postId, status } = data;

    if (!posts.hasOwnProperty(postId)) {
      resStatus = 400;
      resPayload = { error: 'Post not exist' }
    }
    if (posts[postId].comments.hasOwnProperty(id)) {
      resStatus = 400;
      resPayload = { error: 'Comment already exist' };
    }

    const comment = posts[postId].comments.find(comment => {
      return comment.id == id
    });
    comment.status = status;
    comment.content = content;

    resStatus = 200;
    resPayload = { status: 'OK' };
  }

  return resStatus, resPayload;
};

app.get('/posts', (req, res) => {
  res.send(posts);
});

app.post('/events', (req, res) => {
  const { type, data } = req.body;

  let resStatus, resPayload = handleEvent(type, data);

  res.status(resStatus).send(resPayload);
});

app.listen(4002, async () => {
  console.log("Listening on port 4002");

  const res = await axios.get('http://event-bus-srv:5000/events');
  res.data.forEach(event => {
    handleEvent(event.type, event.data);
  });
});
