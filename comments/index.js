import express from 'express';
import bodyParser from 'body-parser';
import { randomBytes } from 'crypto';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  if (!commentsByPostId.hasOwnProperty(postId)) {
    res.status(404).send({error: "Post not exist"});
  } else {
    res.send(commentsByPostId[req.params.id]);
  }
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const postId = req.params.id;
  const { content } = req.body;

  if (!commentsByPostId.hasOwnProperty(postId)) {
    res.status(404).send({error: "Post not exist"});
  } else {
    let comments = commentsByPostId[postId] || [];
    comments.push({ id: commentId, content, status: 'pending' });
    commentsByPostId[postId] = comments;

    await axios.post(
      'http://event-bus-srv:5000/events',
      {
        type: 'CommentCreated',
        data: { id: commentId, content, postId, status: 'pending' }
      }
    );

    res.status(201).send(commentsByPostId[postId]);
  }
});

app.post('/events', async (req, res) => {
  console.log('Received: ', req.body)

  const { type, data } = req.body;

  if (type === 'PostCreated') {
    const postId = data.id;
    commentsByPostId[postId] = [];
  }

  if (type === 'CommentModerated') {
    const { id, postId, status, content } = data;

    if (!commentsByPostId.hasOwnProperty(postId)) {
      res.status(400).send({ error: 'Post not exist' });
    }

    const comment = commentsByPostId[postId].find(comment => {
      return comment.id == id;
    });

    comment.status = status

    await axios.post(
      'http://event-bus-srv:5000/events',
      {
        type: 'CommentUpdated',
        data: { id, content, postId, status }
      }
    ).catch(err => {
      console.log(err.message);
    });
  }

  res.send({ status: 'OK' });
});

app.listen(4001, () => {
  console.log("Listening on port 4001");
});
