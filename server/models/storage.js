const fs = require('fs').promises;
const path = require('path');

const POSTS_FILE = path.join(__dirname, '../../data/posts.json');
const VISITS_FILE = path.join(__dirname, '../../data/visits.json');
const COMMENTS_FILE = path.join(__dirname, '../../data/comments.json');

async function readJson(file, defaultValue = []) {
  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(defaultValue, null, 2), 'utf8');
      return defaultValue;
    }
    throw err;
  }
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

//might cause error later.
function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

module.exports = {
  /* POSTS */
  async getPosts() {
    return await readJson(POSTS_FILE, []);
  },

  async getPostById(id) {
    const posts = await readJson(POSTS_FILE, []);
    return posts.find(p => p._id === id);
  },

  async savePost(post) {
    const posts = await readJson(POSTS_FILE, []);
    if (!post._id) post._id = makeId();
    if (!post.createdAt) post.createdAt = new Date().toISOString();
    posts.unshift(post); // newest first
    await writeJson(POSTS_FILE, posts);
    return post;
  },

  //get list of people who visit
  async addVisit(visit) {
    const visits = await readJson(VISITS_FILE, []);
    const v = {
      _id: makeId(),
      postId: visit.postId || null,
      ip: visit.ip || '',
      ua: visit.ua || '',
      //attach an email if logged in for commenting.
      email: visit.email || null,
      createdAt: new Date().toISOString()
    };
    visits.push(v);
    await writeJson(VISITS_FILE, visits);
    return v;
  },

  async getVisitsForPost(postId) {
    const visits = await readJson(VISITS_FILE, []);
    return visits.filter(v => v.postId === postId);
  },

  async getAllVisits() {
    return await readJson(VISITS_FILE, []);
  },

  /* COMMENTS */
  async getCommentsForPost(postId) {
    const comments = await readJson(COMMENTS_FILE, []);
    return comments.filter(c => c.postId === postId).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  },

  //writ to json file.
  async saveComment(comment) {
    const comments = await readJson(COMMENTS_FILE, []);
    const c = {
      _id: makeId(),
      postId: comment.postId,
      username: comment.username,
      email: comment.email,
      body: comment.body,
      ip: comment.ip || null,
      createdAt: new Date().toISOString()
    };
    comments.push(c);
    await writeJson(COMMENTS_FILE, comments);
    return c;
  },

  async getCommentById(commentId) {
    const comments = await readJson(COMMENTS_FILE, []);
    return comments.find(c => c._id === commentId);
  },

  //admin route only!
  async deleteComment(commentId) {
    const comments = await readJson(COMMENTS_FILE, []);
    const next = comments.filter(c => c._id !== commentId);
    await writeJson(COMMENTS_FILE, next);
    return true;
  }
};
