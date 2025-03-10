# AWS Deployment Talimatları

## Ön Gereksinimler

1. AWS EC2 instance (önerilen: t2.micro veya daha yüksek)
2. Ubuntu 20.04 veya üzeri
3. Domain adı (isteğe bağlı)
4. Git repository erişimi

## Kurulum Adımları

1. AWS sunucunuza SSH ile bağlanın:
```bash
ssh -i your-key.pem ubuntu@your-server-ip
```

2. Deployment scriptini sunucuya kopyalayın:
```bash
scp -i your-key.pem deploy.sh ubuntu@your-server-ip:~/
```

3. Scripti çalıştırılabilir yapın:
```bash
chmod +x deploy.sh
```

4. Scripti düzenleyin ve aşağıdaki değerleri güncelleyin:
   - YOUR_REPOSITORY_URL: Git repo adresiniz
   - your_domain.com: Domain adınız

5. Scripti çalıştırın:
```bash
./deploy.sh
```

## SSL Sertifikası Kurulumu

1. Certbot kurulumu:
```bash
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

2. SSL sertifikası alın:
```bash
sudo certbot --nginx -d your_domain.com
```

## Güvenlik Önerileri

1. AWS Security Group ayarları:
   - Port 80 (HTTP)
   - Port 443 (HTTPS)
   - Port 22 (SSH)

2. UFW Firewall yapılandırması:
```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## Bakım

- Log dosyalarını kontrol etme:
```bash
pm2 logs
sudo tail -f /var/log/nginx/error.log
```

- Sistemi güncelleme:
```bash
sudo apt update && sudo apt upgrade -y
```

- PM2 process'lerini yeniden başlatma:
```bash
pm2 restart all
```

## Sorun Giderme

1. Nginx durumunu kontrol etme:
```bash
sudo systemctl status nginx
```

2. PM2 durumunu kontrol etme:
```bash
pm2 status
```

3. Nginx hata günlüğü:
```bash
sudo tail -f /var/log/nginx/error.log
```

4. Uygulama günlükleri:
```bash
pm2 logs
``` 