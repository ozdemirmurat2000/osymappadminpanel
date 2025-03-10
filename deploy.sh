#!/bin/bash

echo "🚀 Admin Panel Kurulum Scripti Başlatılıyor..."

# Sistem güncellemelerini yap
echo "📦 Sistem güncelleniyor..."
sudo apt update && sudo apt upgrade -y

# Node.js kurulumu
echo "📦 Node.js kuruluyor..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Git kurulumu
echo "📦 Git kuruluyor..."
sudo apt install -y git

# PM2 kurulumu
echo "📦 PM2 kuruluyor..."
sudo npm install -y pm2 -g

# Nginx kurulumu
echo "📦 Nginx kuruluyor..."
sudo apt install -y nginx

# Proje dizini oluştur
echo "📁 Proje dizini oluşturuluyor..."
mkdir -p /var/www/admin-panel

# Projeyi klonla
echo "📥 Proje klonlanıyor..."
git clone https://github.com/ozdemirmurat2000/osymappadminpanel.git /var/www/admin-panel

# Frontend kurulumu
echo "🛠️ Frontend kuruluyor..."
cd /var/www/admin-panel
npm install
npm run build

# Nginx yapılandırması
echo "🔧 Nginx yapılandırılıyor..."
sudo tee /etc/nginx/sites-available/admin-panel << EOF
server {
    listen 80;
    server_name 13.60.94.155; # IP adresiniz

    root /var/www/admin-panel/build;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # CORS ayarları
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length,Content-Range' always;

    if (\$request_method = 'OPTIONS') {
        return 204;
    }
}
EOF

# Nginx sitesini etkinleştir
sudo ln -s /etc/nginx/sites-available/admin-panel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Nginx syntax kontrolü
sudo nginx -t

# Nginx'i yeniden başlat
sudo systemctl restart nginx

# PM2 ile backend'i başlat
echo "🚀 Backend başlatılıyor..."
cd /var/www/admin-panel/backend # Backend dizininize göre ayarlayın
npm install
pm2 start server.js --name "admin-panel-backend"

# PM2'yi sistem başlangıcında otomatik başlatma
pm2 startup
pm2 save

echo "✅ Kurulum tamamlandı!"
echo "🌐 Sitenize şu adresten erişebilirsiniz: http://13.60.94.155"
echo "⚠️ Not: AWS güvenlik grubunuzda port 80'i açmayı unutmayın!" 