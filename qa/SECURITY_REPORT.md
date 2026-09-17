# Informe de Seguridad y Gestión de Vulnerabilidades (SECURITY_REPORT.md)

**Proyecto:** GYM PROGRESS / gymcorleone  
**Fecha:** 17 de Septiembre, 2026  
**Marco de Referencia:** OWASP Top 10 (Web & Client-Side Applications) + CWE (Common Weakness Enumeration)  
**Herramientas de Auditoría:** `npm audit`, Inspección de Cabeceras HTTP Vercel Edge, Análisis Estático de Código (SAST manual).

---

## 1. Resumen Ejecutivo de Postura de Seguridad

| Dimensión de Seguridad | Estado Actual | Nivel de Riesgo | Prioridad |
|---|:---:|:---:|:---:|
| **Cabeceras de Seguridad HTTP (Headers)** | **DEFICIENTE (1/6 presentes)** | **Alto** | Inmediata (P1) |
| **Protección contra Clickjacking** | **VULNERABLE** (Sin `X-Frame-Options`) | **Medio** | Inmediata (P1) |
| **Sanitización de Inputs & XSS** | **BUENO** (React JSX escaping nativo) | **Bajo** | Mantenimiento (P3) |
| **Protección de Datos Sensibles (Storage)** | **MODERADO** (Almacenamiento en LocalStorage) | **Medio** | Fase Cloud (P2) |
| **Dependencias de Terceros (SCA)** | **2 Vulnerabilidades** (1 Critical, 1 High) | **Alto** | Próximo Sprint (P2) |
| **Cifrado en Tránsito (Transport Layer)** | **EXCELENTE** (TLS 1.3 + HSTS 2 años) | **Bajo** | Cumplido |

---

## 2. Auditoría de Cabeceras HTTP de Producción

Evaluación de la respuesta HTTP en vivo obtenida desde `https://gymcorleone-web.vercel.app/`:

| Cabecera HTTP | Estado en Producción | Riesgo Asociado | Configuración Recomendada |
|---|:---:|---|---|
| **`Strict-Transport-Security` (HSTS)** | **PRESENTE** (`max-age=63072000; includeSubDomains; preload`) | Ninguno (Excelente) | Mantener configuración actual |
| **`Content-Security-Policy` (CSP)** | **AUSENTE (FAIL)** | Permite inyección de scripts externos no autorizados si ocurre una vulnerabilidad | `default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; style-src 'self' 'unsafe-inline';` |
| **`X-Frame-Options`** | **AUSENTE (FAIL)** | Ataques de Clickjacking (la app puede incrustarse en un `<iframe>` malicioso) | `DENY` o `SAMEORIGIN` |
| **`X-Content-Type-Options`** | **AUSENTE (FAIL)** | Ataques de MIME-sniffing de archivos descargados | `nosniff` |
| **`Referrer-Policy`** | **AUSENTE (FAIL)** | Fuga de rutas y tokens en cabeceras HTTP `Referer` | `strict-origin-when-cross-origin` |
| **`Permissions-Policy`** | **AUSENTE (FAIL)** | Uso indebido de APIs de hardware (micrófono, geolocalización) | `camera=(self), microphone=(), geolocation=()` |

---

## 3. Matriz de Vulnerabilidades en Dependencias (`npm audit`)

Ejecución de auditoría de seguridad sobre el árbol de dependencias (`package-lock.json`):

```bash
rtk npm audit
```

### Hallazgo 1: Vulnerabilidades Conocidas en `next` (Versión 14.2.35)
- **Severidad:** **CRITICAL** (Grupo de avisos acumulados en ramas previas a v15/v16)
- **Avisos Principales:**
  - `GHSA-9g9p-9gw9-jx7f`: DoS en Image Optimizer mediante `remotePatterns`.
  - `GHSA-h25m-26qc-wcjf`: Deserialización de peticiones HTTP en React Server Components.
  - `GHSA-p293-qw3h-jr36`: Ejecución remota de código no autenticada en servidores Windows autoalojados.
- **Evaluación de Riesgo Real para Gym Progress:**
  - La aplicación está desplegada en la infraestructura Serverless administrada de **Vercel Edge/Linux** (no en servidores Windows propios).
  - No se utilizan Server Actions con payloads arbitrarios ni deserialización insegura en backend.
  - Sin embargo, la exposición a `remotePatterns` en `next/image` y el envejecimiento de la rama 14 exige programar la actualización a la última versión menor de soporte a largo plazo (`14.2.25+` o `15.x`).

### Hallazgo 2: Vulnerabilidad en `postcss` (Versión <= 8.5.22)
- **Severidad:** **HIGH**
- **Aviso:** `GHSA-qx2v-qp2m-jg93` (XSS potencial mediante secuencias `</style>` no escapadas en stringify) y `GHSA-6g55-p6wh-862q` (Divulgación arbitraria de archivos `.map`).
- **Evaluación de Riesgo Real:** Afecta únicamente la fase de compilación CSS (Build time). No es explotable en tiempo de ejecución por clientes finales en producción.

---

## 4. Análisis de Amenazas OWASP Top 10

### A01: Broken Access Control (Control de Acceso Defectuoso)
- **Estado Actual:** La aplicación es cliente-local (`LocalStorage`), sin concepto de roles (Admin, Atleta, Entrenador).
- **Riesgo:** Si un usuario comparte su dispositivo físico, no hay PIN de bloqueo ni separación de perfiles dentro del mismo navegador.
- **Mitigación:** En la siguiente fase de desarrollo, implementar autenticación segura con tokens `HttpOnly` y RBAC.

### A02: Cryptographic Failures (Fallas Criptográficas)
- **Estado Actual:** Las comunicaciones utilizan TLS 1.3 con HSTS.
- **Riesgo:** Los datos guardados en `localStorage` (como notas de entrenamientos o fotos) no se encuentran cifrados en reposo en el dispositivo cliente.
- **Mitigación:** Para datos corporales sensibles, evaluar cifrado con Web Crypto API (AES-GCM) antes de persistir en LocalStorage/IndexedDB.

### A03: Injection & Cross-Site Scripting (XSS)
- **Estado Actual:** **SEGURO.** La aplicación está escrita en TypeScript y React, utilizando el sistema de escape automático de cadenas en JSX.
- **Revisión de Código:** No se detectó ninguna instancia de `dangerouslySetInnerHTML` sobre inputs de usuario ni evaluación de cadenas con `eval()`. Las entradas en la búsqueda y notas se manejan como strings inmutables.

### A05: Security Misconfiguration (Configuración Errónea de Seguridad)
- **Estado Actual:** **VULNERABLE.** La ausencia de cabeceras de seguridad en Next.js deja expuesta la aplicación a ser embebida en marcos de terceros (`iframe`).
- **Mitigación:** Configuración de `headers()` en `next.config.mjs` (ver sección 5).

---

## 5. Plan de Endurecimiento (Hardening Implementation)

### A. Implementación de Cabeceras en `apps/web/next.config.mjs`
Se propone inyectar el siguiente bloque de cabeceras seguras en la configuración del servidor web:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Oculta 'X-Powered-By: Next.js'
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(self), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### B. Sanitización Defensiva en Persistencia
Asegurar que las lecturas desde `localStorage` validen la estructura de datos mediante esquemas Zod o type-guards antes de insertarlos en el estado de React, previniendo inyecciones de objetos malformados por extensiones de navegador.
