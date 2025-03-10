#!/bin/bash

# Renk tanımlamaları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Sunucu bilgileri
SERVER_IP="13.60.94.155"
DOMAIN="www.benimsinavim.site"
PEM_PATH="C:/Users/ozdemirmurat/Downloads/server.pem"
SERVER_USER="ubuntu"
REPO_URL="git@github.com:ozdemirmurat2000/osymappadminpanel.git"

# Loglama fonksiyonu
log() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Hata kontrolü fonksiyonu
check_error() {
    if [ $? -ne 0 ]; then
        log "${RED}❌ Hata: $1${NC}"
        exit 1
    fi
}

# Sunucuda komut çalıştırma fonksiyonu
remote_exec() {
    ssh -i "$PEM_PATH" "$SERVER_USER@$SERVER_IP" "$1"
    check_error "SSH komutu başarısız oldu: $1"
}

# Dosya kopyalama fonksiyonu
remote_copy() {
    scp -i "$PEM_PATH" "$1" "$SERVER_USER@$SERVER_IP:$2"
    check_error "SCP kopyalama başarısız oldu: $1 -> $2"
}

log "🚀 Deployment başlatılıyor..."

# Sunucuda gerekli paketleri kontrol et ve kur
log "📦 Sistem paketleri kontrol ediliyor..."
remote_exec "
    # Node.js kontrolü ve kurulumu
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi

    # Nginx kontrolü ve kurulumu
    if ! command -v nginx &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y nginx
    fi

    # PM2 kontrolü ve kurulumu
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    fi

    # Git kontrolü ve kurulumu
    if ! command -v git &> /dev/null; then
        sudo apt-get install -y git
    fi

    # Certbot kontrolü ve kurulumu
    if ! command -v certbot &> /dev/null; then
        sudo snap install --classic certbot
        sudo ln -sf /snap/bin/certbot /usr/bin/certbot
    fi
"

# Proje dizinlerini oluştur
log "📁 Dizinler hazırlanıyor..."
remote_exec "
    sudo mkdir -p /var/www/admin-panel/frontend
    sudo mkdir -p /var/www/admin-panel/backend
    sudo chown -R ubuntu:ubuntu /var/www/admin-panel
    sudo chmod -R 755 /var/www/admin-panel
"

# Local build işlemi
log "🛠️ Frontend build hazırlanıyor..."
TEMP_DIR="temp_build"
rm -rf $TEMP_DIR
mkdir -p $TEMP_DIR

# Projeyi klonla
log "📥 Proje klonlanıyor..."
git clone $REPO_URL $TEMP_DIR/source
cd $TEMP_DIR/source

# Frontend build
log "📦 Frontend bağımlılıkları yükleniyor..."
npm install --legacy-peer-deps
check_error "npm install başarısız oldu"

log "🔨 Build yapılıyor..."
CI=false GENERATE_SOURCEMAP=false npm run build
check_error "Build başarısız oldu"

# Build dosyalarını sunucuya gönder
log "📤 Build dosyaları sunucuya gönderiliyor..."
cd build
remote_exec "rm -rf /var/www/admin-panel/frontend/*"
remote_copy "*" "/var/www/admin-panel/frontend/"

# Nginx yapılandırması
log "🔧 Nginx yapılandırılıyor..."
remote_exec "
cat > /tmp/admin-panel.conf << 'EOL'
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
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    location / {
        try_files \$uri \$uri/ /index.html;
        expires 30d;
        add_header Cache-Control 'public, no-transform';
    }

    # CORS ayarları
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' '*' always;

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

sudo mv /tmp/admin-panel.conf /etc/nginx/sites-available/admin-panel
sudo ln -sf /etc/nginx/sites-available/admin-panel /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
"

# SSL sertifikası
log "🔒 SSL sertifikası kontrol ediliyor..."
remote_exec "
    sudo certbot --nginx -d ${DOMAIN} --non-interactive --agree-tos --email ozdemirmurat2000@gmail.com --redirect || true
    sudo nginx -t && sudo systemctl restart nginx
"

# Firewall ayarları
log "🛡️ Güvenlik duvarı ayarlanıyor..."
remote_exec "
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw allow 22
    sudo ufw allow 3001
    echo 'y' | sudo ufw enable
"

# Temizlik
log "🧹 Geçici dosyalar temizleniyor..."
cd ../..
rm -rf $TEMP_DIR

log "${GREEN}✅ Deployment başarıyla tamamlandı!${NC}"
log "${GREEN}🌐 Sitenize şu adreslerden erişebilirsiniz:${NC}"
log "   http://${DOMAIN}"
log "   https://${DOMAIN}"
log ""
log "${YELLOW}⚠️ Önemli Komutlar:${NC}"
log "  - Nginx durumu: ssh -i $PEM_PATH $SERVER_USER@$SERVER_IP 'sudo systemctl status nginx'"
log "  - Nginx logları: ssh -i $PEM_PATH $SERVER_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/error.log'"
log "  - Go API durumu: ssh -i $PEM_PATH $SERVER_USER@$SERVER_IP 'sudo systemctl status osymapp'" 