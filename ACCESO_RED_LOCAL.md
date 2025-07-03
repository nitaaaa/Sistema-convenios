# 🌐 Acceso desde Red Local

## 📋 Información de Acceso

### **IP del Servidor:**
- **IP Local:** `10.129.101.62`
- **Puerto Frontend:** `3002`
- **Puerto Backend:** `3000`

### **URLs de Acceso:**

#### **Frontend (Interfaz Web):**
```
https://10.129.101.62:3002
```

#### **Backend (API):**
```
https://10.129.101.62:3000
```

## 🚀 Instrucciones de Acceso

### **1. Desde Otros Equipos de la Red:**

1. **Abrir navegador web** en el equipo cliente
2. **Ingresar la URL:** `https://10.129.101.62:3002`
3. **Aceptar el certificado SSL** (si aparece advertencia de seguridad)
4. **Iniciar sesión** con las credenciales correspondientes

### **2. Configuración de Firewall:**

#### **Windows Firewall:**
- Abrir "Firewall de Windows Defender"
- Permitir aplicaciones a través del firewall
- Agregar excepción para puertos 3000 y 3002

#### **Comandos PowerShell (como Administrador):**
```powershell
# Permitir puerto 3000 (Backend)
netsh advfirewall firewall add rule name="Convenios Backend" dir=in action=allow protocol=TCP localport=3000

# Permitir puerto 3002 (Frontend)
netsh advfirewall firewall add rule name="Convenios Frontend" dir=in action=allow protocol=TCP localport=3002
```

### **3. Verificar Conectividad:**

#### **Ping al Servidor:**
```bash
ping 10.129.101.62
```

#### **Verificar Puertos:**
```bash
# Desde otro equipo
telnet 10.129.101.62 3002
telnet 10.129.101.62 3000
```

## ⚠️ Consideraciones de Seguridad

### **Certificados SSL:**
- Los certificados son autofirmados
- Los navegadores mostrarán advertencias de seguridad
- **En desarrollo:** Aceptar la excepción de seguridad
- **En producción:** Usar certificados válidos

### **Acceso de Red:**
- Solo equipos en la misma red pueden acceder
- No está configurado para acceso desde Internet
- Considerar VPN para acceso remoto seguro

## 🔧 Configuración de Variables de Entorno

### **Backend (.env):**
```env
HOST=0.0.0.0
PORT=3000
FRONTEND_URL=https://10.129.101.62:3002
```

### **Frontend (vite.config.js):**
```javascript
server: {
  port: 3002,
  host: '0.0.0.0',
  proxy: {
    '/api': {
      target: 'https://10.129.101.62:3000',
      changeOrigin: true,
      secure: false
    }
  }
}
```

## 🚨 Solución de Problemas

### **Error: "No se puede acceder a este sitio"**
1. Verificar que el servidor esté ejecutándose
2. Verificar configuración de firewall
3. Verificar conectividad de red

### **Error: "Certificado no válido"**
1. Hacer clic en "Avanzado"
2. Hacer clic en "Continuar a 10.129.101.62 (no seguro)"
3. Aceptar la excepción de seguridad

### **Error: "CORS" o "API no disponible"**
1. Verificar que el backend esté ejecutándose en puerto 3000
2. Verificar configuración del proxy en Vite
3. Verificar que las URLs coincidan

## 📱 Acceso desde Dispositivos Móviles

### **Android/iOS:**
1. Conectar al mismo WiFi
2. Abrir navegador
3. Ingresar: `https://10.129.101.62:3002`
4. Aceptar certificado SSL

### **Tablets:**
- Mismo proceso que dispositivos móviles
- La interfaz es responsiva y se adapta

## 🔄 Reiniciar Servicios

### **Backend:**
```bash
cd backend
npm start
```

### **Frontend:**
```bash
cd frontend
npm run dev
```

## 📞 Contacto

Si tienes problemas de acceso, verificar:
1. ✅ Servidor ejecutándose
2. ✅ Firewall configurado
3. ✅ Equipos en la misma red
4. ✅ URLs correctas

---

**Nota:** Esta configuración es para desarrollo. En producción, usar dominios reales y certificados SSL válidos. 