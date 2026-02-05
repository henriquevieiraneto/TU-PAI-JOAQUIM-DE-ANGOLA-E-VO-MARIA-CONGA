@echo off
echo 🌀 Sincronizando com o Terreiro Online...
git pull origin main --rebase
git add .
git commit -m "Atualizacao via PC"
git push origin main
echo ✅ Tudo pronto e atualizado!
pause