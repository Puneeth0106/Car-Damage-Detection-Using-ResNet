# Deployment Guide — AWS EC2

This guide walks you through deploying this project on an AWS EC2 instance using Docker Compose. By the end, the app will be accessible at your server's public IP.

---

## Prerequisites

Before you start, make sure you have:
- An **AWS account**
- The **trained model file** `saved_model.pth` (~90MB) — not included in this repo due to size
- **Docker Desktop** installed on your local machine (only needed to test locally)

---

## How It Works

The app runs as two Docker containers on a single EC2 instance:

```
Internet
   │  port 80
   ▼
[Nginx]  ──  serves the React frontend
   │          proxies /api/* requests
   ▼
[FastAPI]  ──  runs the ResNet50 model
   │
   ▼
[saved_model.pth]  ──  mounted from disk (not baked into the image)
```

---

## Step 1 — Launch an EC2 Instance

1. Go to **AWS Console → EC2 → Launch Instance**

2. Configure the following:

   | Setting | Value |
   |---|---|
   | AMI | Amazon Linux 2023 |
   | Instance type | `t3.micro` (free tier eligible) |
   | Key pair | Create a new `.pem` key and **download it** |
   | Storage | **20 GiB** gp3 (increase from the default 8 GiB — needed for Docker + PyTorch) |

3. Under **Network Settings**, enable all three:
   - Allow SSH traffic from **My IP**
   - Allow HTTP traffic from the internet
   - Allow HTTPS traffic from the internet

4. Click **Launch Instance** and wait for the state to show `running`.

5. Note the **Public IPv4 address** from the instance details page.

---

## Step 2 — SSH Into the Instance

On your local machine:

```bash
chmod 400 ~/Downloads/your-key.pem
ssh -i ~/Downloads/your-key.pem ec2-user@<YOUR_EC2_IP>
```

Type `yes` when prompted about the host fingerprint.

---

## Step 3 — Install Docker

Run these commands on the EC2 instance:

```bash
sudo yum update -y
sudo yum install -y docker git
sudo service docker start
sudo usermod -aG docker ec2-user
```

Install the Docker Compose plugin:

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

Install the latest Buildx (required by newer Docker Compose):

```bash
sudo curl -SL "https://github.com/docker/buildx/releases/download/v0.19.3/buildx-v0.19.3.linux-amd64" \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx
```

Log out and back in for the docker group change to take effect:

```bash
exit
ssh -i ~/Downloads/your-key.pem ec2-user@<YOUR_EC2_IP>
```

Verify:
```bash
docker --version && docker compose version
```

---

## Step 4 — Clone the Repository

On the EC2 instance:

```bash
git clone https://github.com/Puneeth0106/Car-Damage-Detection-Using-ResNet.git
cd Car-Damage-Detection-Using-ResNet
mkdir -p model
```

---

## Step 5 — Transfer the Model File

The model weights are not in the repository. Run this command from your **local machine** (not EC2):

```bash
scp -i ~/Downloads/your-key.pem \
  path/to/saved_model.pth \
  ec2-user@<YOUR_EC2_IP>:~/Car-Damage-Detection-Using-ResNet/model/
```

Wait for the upload to complete before proceeding.

---

## Step 6 — Build and Start the App

Back on the EC2 instance:

```bash
docker compose up --build -d
```

> The first build downloads PyTorch (~800MB) and will take around **10–15 minutes**. Subsequent builds are much faster due to Docker's layer caching.

Watch the logs:
```bash
docker compose logs -f
```

Once you see `Uvicorn running on http://0.0.0.0:8000`, the app is ready.

Open in your browser:
```
http://<YOUR_EC2_IP>
```

---

## Useful Commands

```bash
# Check running containers
docker compose ps

# View live logs
docker compose logs -f

# Restart only the backend (e.g. after updating the model file)
docker compose restart backend

# Pull latest code and rebuild
git pull && docker compose up --build -d

# Stop everything
docker compose down
```

---

## Updating the Model

Since the model is mounted as a volume (not baked into the Docker image), you can update it without rebuilding:

```bash
# Transfer the new model from your local machine
scp -i ~/Downloads/your-key.pem new_model.pth ec2-user@<YOUR_EC2_IP>:~/Car-Damage-Detection-Using-ResNet/model/saved_model.pth

# Restart only the backend to load the new weights
docker compose restart backend
```

---

## Running Locally (Without AWS)

```bash
docker compose up --build
```

Open `http://localhost`
