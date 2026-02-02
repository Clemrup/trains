# ⚡ Quick Start - 30 minutes chrono!

Si vous êtes pressé, suivez EXACTEMENT ces 6 étapes.

## Étape 1 : Supabase (5 min)

```bash
# 1. Allez sur https://supabase.com → Sign Up
# 2. Créez un projet nommé "trains-catalog"
# 3. Attendez le déploiement
# 4. Settings → API → Copiez URL et Key
# 5. SQL Editor → Collez le contenu de supabase_migration.sql
# 6. Cliquez "Run" → Attendez "Success"
```

Résultat :
```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...xxxxx
```

## Étape 2 : Config locale (3 min)

```powershell
# 1. Ouvrez le fichier: trains/.env.local
# 2. Collez vos clés Supabase:
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...xxxxx

# 3. Sauvegardez
```

## Étape 3 : Installer (2 min)

```powershell
# Dans le dossier trains/
npm install
```

## Étape 4 : Tester local (3 min)

```powershell
npm run dev
# Ouvrez: http://localhost:3000/public/index.html
```

✅ Vous devez voir le formulaire!

## Étape 5 : GitHub (10 min)

```powershell
# Dans le dossier trains/
git init
git config user.name "Nom"
git config user.email "email@mail.com"
git add .
git commit -m "Initial"

# Sur GitHub.com:
# 1. Créez un repo "trains"
# 2. Copiez la commande push:
git remote add origin https://github.com/USERNAME/trains.git
git branch -M main
git push -u origin main
```

## Étape 6 : Vercel (7 min)

```
1. Allez sur vercel.com
2. "Import Project" → Sélectionnez trains
3. Settings → Environment Variables:
   - VITE_SUPABASE_URL = votre URL
   - VITE_SUPABASE_ANON_KEY = votre KEY
4. Save → Deploy!
5. Attendez "Ready" (vert)
6. Cliquez le lien → Votre site est live! 🎉
```

---

## ✨ Terminé en 30 min!

Votre site est maintenant sur Vercel avec Supabase! 🚀

Pour la migration des données (trains_db.sql → Supabase), consultez:
→ `DEPLOY_GUIDE.md` section "Migration des Données"

Pour l'aide complète étape-par-étape:
→ `ACTIONS_CHECKLIST.md`
