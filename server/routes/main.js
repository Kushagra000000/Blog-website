const express = require('express');
const router = express.Router();
const storage = require('../models/storage');
const { marked } = require('marked');

// helper to get client IP
//should give a warning that ip is being logged
function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
}

/* home page route */
router.get('/', async (req, res) => {
  const locals = { title: "Kushagra's blog", description: "Personal blog website" };
  const posts = await storage.getPosts();
  res.render('index', { locals, data: posts });
});

//about page route
router.get('/about', (req, res) => {
  const locals = { title: 'About', description: 'About this blog' };
  res.render('about', { locals });
});

//post and id
router.get('/post/:id', async (req, res) => {
  const id = req.params.id;
  const post = await storage.getPostById(id);
  if (!post) return res.status(404).send('Post not found');
  post.bodyHtml = marked(post.body || '');

  // Record visit
  const ip = getClientIp(req);
  await storage.addVisit({ postId: id, ip, ua: req.get('user-agent') || '' });

  const visits = await storage.getVisitsForPost(id);
  post.views = visits.length;

  const comments = await storage.getCommentsForPost(id);

  res.render('post', { data: post, comments, locals: { title: post.title, description: post.title } });
});

//need to add automoderation keyword search for v2
router.post('/post/:id/comment', async (req, res) => {
  const postId = req.params.id;
  const { username, email, body } = req.body || {};
  const ip = getClientIp(req);

  if (!username || !email || !body) {
    return res.redirect(`/post/${postId}`);
  }
  
  //could more more advance email checking
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.redirect(`/post/${postId}`);
  }

  //store to json (storage.js)
  await storage.saveComment({
    postId,
    username,
    email,
    body,
    ip
  });

  //storage.js
  await storage.addVisit({
    postId,
    ip,
    ua: req.get('user-agent') || '',
    email
  });

  res.redirect(`/post/${postId}#comments`);
});

//search page
router.post('/search', async (req, res) => {
  const term = (req.body.searchTerm || '').toLowerCase();
  const posts = await storage.getPosts();
  const results = posts.filter(p => p.title.toLowerCase().includes(term) || (p.body || '').toLowerCase().includes(term));
  res.render('search', { data: results, locals: { title: `Search results for: ${term}`, description: 'Search page' } });
});

router.get('/now', async (req, res) => {
  const now = await storage.getNow();
  res.render('now', { locals: { title: 'Now', description: 'What I am currently up to' }, data: now });
});

module.exports = router;
