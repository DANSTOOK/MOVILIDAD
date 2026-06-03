# Setup Automático para Push a GitHub

Este documento permite a Claude hacer push automáticamente a tu repositorio sin pedir credenciales cada vez.

## ✅ Requisitos
- Windows 10+
- Git con Credential Manager
- GitHub Personal Access Token (PAT)

## 📝 Paso 1: Crear un GitHub Personal Access Token

1. Ve a https://github.com/settings/tokens/new
2. Nombre: `Claude Auto Push`
3. Expiration: `No expiration` (o lo que prefieras)
4. Scopes: Selecciona **`repo`** (acceso completo al repositorio)
5. Click en **"Generate token"**
6. ⚠️ **Copia el token inmediatamente** (no podrás verlo de nuevo)
7. Guarda el token en un lugar seguro (o pásalo a Claude para setup)

**Token debe tener formato**: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## 🔐 Paso 2: Setup en Windows Credential Manager

Ejecuta este script PowerShell (como Administrador):

```powershell
# PowerShell como Administrador
$token = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Reemplaza con tu token
$username = "danielfonseca315"  # Tu usuario de GitHub
$url = "https://github.com"

# Almacenar credenciales en Windows Credential Manager
$cred = New-Object System.Management.Automation.PSCredential(
  $username,
  (ConvertTo-SecureString $token -AsPlainText -Force)
)

# Guardar en Credential Manager
cmdkey /add:github.com /user:$username /pass:$token

Write-Host "✅ Credenciales almacenadas en Credential Manager"
Write-Host "GitHub username: $username"
Write-Host "Ahora git push funcionará automáticamente"
```

**O ejecútalo directamente:**

```bash
# En PowerShell o CMD como Administrador
cmdkey /add:github.com /user:tu_usuario_github /pass:tu_token_github
```

Ejemplo:
```bash
cmdkey /add:github.com /user:DANSTOOK /pass:ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## ✅ Paso 3: Verificar que funciona

```bash
cd "C:\Users\5481292\Downloads\PROYECTOS CLAUDE\REPORTE MOVILIDAD"
git push origin main
```

Si funciona, verás:
```
Enumerating objects: 6, done.
Counting objects: 100% (6/6), done.
...
To https://github.com/DANSTOOK/MOVILIDAD.git
   41a8fea..e9b4987  main -> main
```

## 🤖 Paso 4: Habilita Auto-Push para Claude

Una vez que las credenciales estén configuradas, Claude puede hacer push automáticamente usando:

```bash
cd "C:\Users\5481292\Downloads\PROYECTOS CLAUDE\REPORTE MOVILIDAD"
git push origin main
```

## 🔒 Seguridad

- ✅ Las credenciales se almacenan en **Windows Credential Manager** (encriptado)
- ✅ El token se puede revocar en GitHub en cualquier momento
- ✅ Solo tiene permisos `repo` (acceso a tus repositorios públicos/privados)
- ✅ Si quieres revocar acceso, ve a https://github.com/settings/tokens y elimina el token

## ❌ Si ya no quieres usar auto-push

```bash
# Eliminar credenciales de Credential Manager
cmdkey /delete:github.com
```

## 📚 Referencias

- [GitHub Personal Access Tokens](https://github.com/settings/tokens)
- [Windows Credential Manager](https://support.microsoft.com/en-us/windows/accessing-credential-manager-b9639f89-e421-4707-a77c-0a31fc0ac0b7)
- [Git Credential Manager for Windows](https://github.com/git-ecosystem/git-credential-manager)

---

**Una vez completados estos pasos, Claude podrá hacer `git push` automáticamente sin pedir credenciales.**
