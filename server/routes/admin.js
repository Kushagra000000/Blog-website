const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const storageModel = require('../models/storage');
require('dotenv').config();

//should use hash for more secure login (do this if your're planning to deploy this)
//also the structure for the .env file is listed at the botton of this file.
const ADMIN_PASS = process.env.SESSION_SECRET;// set in .env
// const ADMIN_HASH = process.env.ADMIN_HASH

const uploadDir = path.join(__dirname, '../../public/uploads');

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 }
  // 5MB per image (increas this depending on vm storage space on chromebook)
});

// middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.isAuth) return next();
  return res.redirect('/admin/login');
}

//login rout
router.get('/login', (req, res) => {
  res.render('admin/login', { locals: { title: 'Admin Login' }, error: null });
});
router.post('/login', (req, res) => {
  const pass = req.body.password;
  //if (pass === ADMIN_HASH) ...
  if (pass === ADMIN_PASS) {
    req.session.isAuth = true;
    return res.redirect('/admin');
  }
  res.render('admin/login', { locals: { title: 'Admin Login' }, error: 'Invalid password' });
});
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

//admin dashboard.
router.get('/', requireAuth, async (req, res) => {
  const posts = await storageModel.getPosts();
  res.render('admin/index', { locals: { title: 'Admin Dashboard' }, posts });
});

//new post (now protected through admin/login)
router.get('/new', requireAuth, (req, res) => {
  res.render('admin/new', { locals: { title: 'Create Post' }, error: null });
});

router.post('/new', requireAuth, upload.array('images', 6), async (req, res) => {
  try {
    const { title, body } = req.body;
    const files = (req.files || []).map(f => `/uploads/${path.basename(f.path)}`);
    const post = { title: title || 'Untitled', body: body || '', images: files, createdAt: new Date().toISOString() };
    await storageModel.savePost(post);
    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.render('admin/new', { locals: { title: 'Create Post' }, error: 'Error creating post' });
  }
});

//visitors (need to be logged in)
router.get('/visitors', requireAuth, async (req, res) => {
  const postId = req.query.postId || null;
  let visits = [];
  if (postId) {
    visits = await storageModel.getVisitsForPost(postId);
  } else {
    visits = await storageModel.getAllVisits();
  }
  res.render('admin/visitors', { locals: { title: 'Visitors' }, visits, postId });
});

//comment on posts (only admin sees the email)
router.get('/comments/:postId', requireAuth, async (req, res) => {
  const postId = req.params.postId;
  const comments = await storageModel.getCommentsForPost(postId);
  res.render('admin/comments', { locals: { title: 'Comments' }, comments, postId });
});

//delete comment (need to create .yaml file now)
router.post('/comments/delete/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  // get comment to find postId for redirect
  const comment = await storageModel.getCommentById(id);
  if (comment) {
    await storageModel.deleteComment(id);
    return res.redirect(`/admin/comments/${comment.postId}`);
  }
  res.redirect('/admin');
});

module.exports = router;


/* 
ADMIN_HASH=(recommended)
SESSION_SECRET=(your password)
NODE_ENV=production
PORT=3000(any other port works too if already in use).
*/
