#!/bin/bash

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 Admin Panel Deployment Scripti Başlatılıyor...${NC}"

# Sunucu bilgileri
SERVER_IP="13.60.94.155"
DOMAIN="www.benimsinavim.site"
PEM_PATH="C:/Users/ozdemirmurat/Downloads/server.pem"
SERVER_USER="ubuntu"
REPO_URL="git@github.com:ozdemirmurat2000/osymappadminpanel.git"

# Local build işlemi
echo -e "${YELLOW}📦 Local build başlatılıyor...${NC}"

# Geçici dizin oluştur
TEMP_DIR="temp_build"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR/deploy/frontend
mkdir -p $TEMP_DIR/deploy/backend

# Projeyi klonla
echo -e "${YELLOW}📥 Proje klonlanıyor...${NC}"
git clone $REPO_URL $TEMP_DIR/source

# Frontend build öncesi API URL'sini düzenle
echo -e "${YELLOW}🔧 API URL yapılandırılıyor...${NC}"
cat > $TEMP_DIR/source/src/api/axios.js << EOF
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://${SERVER_IP}:3001',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)token\s*=\s*([^;]*).*$)|^.*$/, "$1");
        if (token) {
            config.headers.Authorization = \`Bearer \${token}\`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response);
        return Promise.reject(error);
    }
);

export default api;
EOF

# Frontend build
echo -e "${YELLOW}🛠️ Frontend build hazırlanıyor...${NC}"
cd $TEMP_DIR/source

echo -e "${YELLOW}📦 Bağımlılıklar yükleniyor...${NC}"
npm install

echo -e "${YELLOW}🔨 Build yapılıyor...${NC}"
CI=false GENERATE_SOURCEMAP=false npm run build

# Build sonucunu kontrol et
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build işlemi başarısız oldu!${NC}"
    exit 1
fi

# Build klasörünü kontrol et
if [ ! -d "build" ]; then
    echo -e "${RED}❌ Build klasörü bulunamadı!${NC}"
    echo -e "${YELLOW}📂 Mevcut dizin içeriği:${NC}"
    ls -la
    exit 1
fi

# Build içeriğini kontrol et
if [ ! -f "build/index.html" ]; then
    echo -e "${RED}❌ index.html bulunamadı!${NC}"
    echo -e "${YELLOW}📂 Build içeriği:${NC}"
    ls -la build/
    exit 1
fi

echo -e "${GREEN}✅ Build başarıyla tamamlandı${NC}"

# Build dosyalarını kopyala
echo -e "${YELLOW}📦 Build dosyaları kopyalanıyor...${NC}"
mkdir -p $TEMP_DIR/deploy/frontend
cp -r build/* $TEMP_DIR/deploy/frontend/

# Dosyaların kopyalandığını kontrol et
echo -e "${YELLOW}📦 Build dosyaları kontrol ediliyor...${NC}"
if [ ! -f "$TEMP_DIR/deploy/frontend/index.html" ]; then
    echo -e "${RED}❌ Frontend dizininde index.html bulunamadı!${NC}"
    echo -e "${YELLOW}📂 Frontend dizin içeriği:${NC}"
    ls -la $TEMP_DIR/deploy/frontend/
    exit 1
fi

# Sunucuda dizinleri hazırla
echo -e "${YELLOW}📤 Sunucu dizinleri hazırlanıyor...${NC}"
ssh -i "$PEM_PATH" "$SERVER_USER@$SERVER_IP" "
    sudo rm -rf /var/www/admin-panel/frontend/*
    sudo mkdir -p /var/www/admin-panel/frontend
    sudo chown -R ubuntu:ubuntu /var/www/admin-panel
    sudo chmod -R 755 /var/www/admin-panel
"

# Dosyaları gönder
echo -e "${YELLOW}📤 Dosyalar sunucuya gönderiliyor...${NC}"
cd $TEMP_DIR/deploy
scp -i "$PEM_PATH" -r frontend/* "$SERVER_USER@$SERVER_IP:/var/www/admin-panel/frontend/"

# Sunucuda dosyaları kontrol et
echo -e "${YELLOW}📋 Sunucuda dosyalar kontrol ediliyor...${NC}"
ssh -i "$PEM_PATH" "$SERVER_USER@$SERVER_IP" "
    if [ ! -f '/var/www/admin-panel/frontend/index.html' ]; then
        echo '${RED}❌ Sunucuda index.html bulunamadı!${NC}'
        echo '${YELLOW}📂 Sunucu dizin içeriği:${NC}'
        ls -la /var/www/admin-panel/frontend/
        exit 1
    fi
    echo '${GREEN}✅ Dosyalar başarıyla yüklendi${NC}'
"

# Backend için environment değişkenlerini ayarla
echo -e "${YELLOW}🔧 Backend environment ayarlanıyor...${NC}"
cat > $TEMP_DIR/deploy/backend/.env << EOF
PORT=8080
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=your_mongodb_uri_here
EOF

# Backend dosyalarını kopyala
echo -e "${YELLOW}📦 Backend dosyaları kopyalanıyor...${NC}"
cp -r backend/* ../deploy/backend/

# Sunucudaki dizini temizle ve yeni dosyaları gönder
echo -e "${YELLOW}📤 Dosyalar sunucuya gönderiliyor...${NC}"
ssh -i "$PEM_PATH" "$SERVER_USER@$SERVER_IP" "sudo mkdir -p /var/www/admin-panel && sudo chown -R ubuntu:ubuntu /var/www/admin-panel && rm -rf /var/www/admin-panel/*"
cd $TEMP_DIR
scp -i "$PEM_PATH" -r deploy/* "$SERVER_USER@$SERVER_IP:/var/www/admin-panel/"

# Uzak sunucuda çalıştırılacak komutlar
REMOTE_COMMANDS="
    # Hata durumunda scripti durdur
    set -e

    echo -e '${YELLOW}🔧 Sunucu yapılandırması başlatılıyor...${NC}'
    
    # PM2 processlerini durdur ve sil
    if command -v pm2 &> /dev/null; then
        pm2 delete all 2>/dev/null || true
        pm2 save 2>/dev/null || true
    fi
    
    # Backend için environment dosyasını kontrol et
    echo -e '${YELLOW}📦 Backend environment kontrol ediliyor...${NC}'
    if [ ! -f '/var/www/admin-panel/backend/.env' ]; then
        echo -e '${RED}❌ .env dosyası bulunamadı!${NC}'
        exit 1
    fi
    
    # Backend kurulumu
    echo -e '${YELLOW}📦 Backend kuruluyor...${NC}'
    cd /var/www/admin-panel/backend
    npm install --production
    
    # PM2 ile backend'i başlat ve logları göster
    echo -e '${YELLOW}🚀 Backend başlatılıyor...${NC}'
    pm2 delete admin-panel-backend || true
    pm2 start server.js --name 'admin-panel-backend' --log backend.log
    pm2 save
    
    # Backend loglarını kontrol et
    echo -e '${YELLOW}📋 Backend logları kontrol ediliyor...${NC}'
    sleep 5
    tail -n 50 backend.log
    
    # Nginx konfigürasyonu
    echo -e '${YELLOW}🔧 Nginx yapılandırılıyor...${NC}'
    sudo tee /etc/nginx/sites-available/admin-panel << EOF
server {
    listen 80;
    server_name ${DOMAIN};

    root /var/www/admin-panel/frontend;
    index index.html;

    # Gzip sıkıştırma
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";

    location / {
        try_files \$uri \$uri/ /index.html;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location /static/ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # CORS ayarları
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' '*' always;
    add_header 'Access-Control-Max-Age' 1728000;

    if (\$request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' '*' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    # Hata sayfaları
    error_page 404 /index.html;
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

    # Nginx sitesini etkinleştir
    sudo ln -sf /etc/nginx/sites-available/admin-panel /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # SSL sertifikası al veya yenile
    echo -e '${YELLOW}🔒 SSL sertifikası kontrol ediliyor...${NC}'
    sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ozdemirmurat2000@gmail.com --redirect || true
    
    # Nginx'i yeniden başlat
    sudo nginx -t && sudo systemctl restart nginx
    
    echo -e '${GREEN}✅ Sunucu yapılandırması tamamlandı!${NC}'
"

# SSH ile komutları çalıştır
echo -e "${YELLOW}🔑 Sunucuya bağlanılıyor...${NC}"
ssh -i "$PEM_PATH" "$SERVER_USER@$SERVER_IP" "$REMOTE_COMMANDS"

# Geçici dosyaları temizle
cd ../..
rm -rf $TEMP_DIR

echo -e "${GREEN}✅ Deployment başarıyla tamamlandı!${NC}"
echo -e "${YELLOW}🌐 Sitenize şu adreslerden erişebilirsiniz:${NC}"
echo -e "${YELLOW}   http://${DOMAIN}${NC}"
echo -e "${YELLOW}   https://${DOMAIN}${NC}" 