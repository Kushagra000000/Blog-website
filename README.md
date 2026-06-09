# Blog Website

A personal blog website built with Node.js and Express, self-hosted on a Raspberry Pi 5 behind a Cloudflare Tunnel.
Posts, comments, and visits are stored in flat JSON files therefore no database required.

Originally based on the Net Ninja YouTube series *"How to build a blog with Node.js, Express and MongoDB"*, then heavily modified: MongoDB swapped for JSON file storage, full redesign, admin panel, image uploads, visitor logging, Markdown rendering, and a `/now` page...


## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express 5
- **Templating:** EJS + express-ejs-layouts
- **Storage:** JSON files (no database)
- **Markdown:** marked v4
- **File uploads:** multer
- **Sessions:** express-session
- **Process manager (Pi):** PM2
- **Tunnel (Pi):** Cloudflare Tunnel


## Setup Instructions:

### 1. Clone the repo

```bash
git clone https://github.com/Kushagra000000/Blog-website.git
cd Blog-website
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create your config file

Copy the example and fill in your details:

```bash
cp site.config.example.js site.config.js
```

Edit `site.config.js` with your name, tagline, email, and social links.

### 4. Create your `.env` file

```bash
cp .env.example .env
```

Open `.env` and set:

```
SESSION_SECRET=pick-a-long-random-string
NODE_ENV=development
PORT=3000
```

`SESSION_SECRET` is your admin panel password. Choose something strong.

### 5. Run the app

```bash
npm start
```


## Raspberry Pi Deployment

```bash
# SSH into Pi
ssh pi@<your-pi-ip>

# Clone repo
git clone https://github.com/Kushagra000000/Blog-website.git
cd Blog-website

# Install dependencies
npm install

# Follow the setup instrucctions...

# Start with PM2
pm2 start app.js --name kushagra-blog
pm2 save
pm2 startup


### Cloudflare Tunnel (as on my initial setup)

The tunnel connects your Pi to your domain without exposing your home IP
This is required if you don\'t have access to your router settings.

```bash
# Check tunnel is running
cloudflared tunnel list

# to start
cloudflared tunnel run <your-tunnel-name>

# To run it as a service (restart on reboot of device)
sudo cloudflared service install
sudo systemctl start cloudflared
```

## License
 
MIT — use freely, attribution appreciated but not required.