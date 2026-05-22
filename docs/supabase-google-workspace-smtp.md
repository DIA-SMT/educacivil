# Reset de contraseña con Google Workspace SMTP

## Objetivo
Usar una cuenta institucional personal de Google Workspace como remitente SMTP para los correos de Supabase Auth, sin cambiar el flujo actual de recuperación de contraseña de la app.

El código actual que depende de Supabase Auth sigue siendo:

- `app/auth/forgot-password/actions.ts`
- `app/auth/callback/route.ts`
- `app/auth/reset-password/actions.ts`

## Alcance
Esta configuración reemplaza el mailer por defecto de Supabase Auth.

Impacta en:

- recuperación de contraseña
- confirmación de registro por email
- cualquier otro correo transaccional que salga desde Supabase Auth

No agrega proveedores nuevos al repo ni requiere migraciones SQL.

## Datos necesarios
Antes de configurar Supabase, tener a mano:

- email institucional personal que se usará como remitente
- nombre visible del remitente
- contraseña de aplicación o credencial SMTP habilitada por Google Workspace
- confirmación de que la cuenta puede enviar correos SMTP
- responsable de la casilla para futuras rotaciones

## Configuración en Google Workspace
1. Confirmar que la cuenta tenga habilitado el mecanismo de autenticación requerido para SMTP.
2. Si el tenant lo permite, generar una `App Password` para la cuenta.
3. Si no permite `App Password`, pedir al administrador del tenant el mecanismo SMTP admitido.
4. Verificar que no haya bloqueos de seguridad que impidan el acceso SMTP desde Supabase.

## Configuración en Supabase
En el panel de Supabase del proyecto:

1. Ir a `Authentication`.
2. Abrir la configuración de `SMTP`.
3. Activar `Custom SMTP`.
4. Cargar los datos de la cuenta institucional.

Valores esperados para Google Workspace SMTP:

- `Host`: `smtp.gmail.com`
- `Port`: `587`
- `Username`: correo institucional completo
- `Password`: credencial SMTP o `App Password`
- `Sender email`: mismo correo institucional
- `Sender name`: nombre institucional visible

Si el proyecto prefiere SSL directo en vez de STARTTLS, validar si Supabase y la cuenta funcionan correctamente con `465`. Para este proyecto se recomienda empezar con `587`.

## Remitente recomendado
Aunque la cuenta sea personal institucional, el remitente visible debe verse institucional.

Ejemplo:

- `Sender name`: `Municipalidad de San Miguel de Tucumán`

Si el panel permite reply-to separado, usar el criterio operativo que defina el equipo. Si no hay una definición clara, dejar reply-to implícito en la misma casilla.

## Prueba manual obligatoria
Después de guardar SMTP en Supabase:

1. Pedir recuperación de contraseña desde la UI.
2. Confirmar que el correo llegue desde la casilla institucional.
3. Abrir el link recibido.
4. Cambiar la contraseña.
5. Confirmar que el usuario pueda iniciar sesión con la nueva contraseña.
6. Probar también el alta por email si sigue usando confirmación por correo.

## Verificaciones funcionales
Probar al menos estos casos:

- usuario existente solicita reset y recibe correo
- email inexistente no rompe la experiencia
- el enlace de recovery redirige correctamente a `/auth/reset-password`
- el flujo de actualización de contraseña completa sin errores
- los mails de confirmación de registro siguen saliendo correctamente

## Riesgos de esta solución
Esta cuenta es institucional, pero operativamente sigue siendo personal.

Riesgos concretos:

- si cambia la contraseña, puede quedar inválido el SMTP
- si la persona pierde acceso o cambia de rol, el flujo deja de funcionar
- si Google Workspace endurece políticas, puede requerir reconfiguración
- la responsabilidad operativa queda atada a una persona

Por eso esta configuración debe considerarse transitoria.

## Rotación de credenciales
Si la credencial SMTP queda inválida:

1. Regenerar la credencial en Google Workspace.
2. Actualizar la configuración SMTP en Supabase.
3. Ejecutar otra vez la prueba manual completa.
4. Registrar la fecha de cambio y responsable.

## Contingencia
Si los correos dejan de salir:

1. Revisar el estado de la cuenta y la credencial en Google Workspace.
2. Confirmar que Supabase siga apuntando a la credencial vigente.
3. Probar un nuevo reset desde la UI.
4. Si no se resuelve rápido, definir una casilla de reemplazo temporal.

## Recomendación futura
Cuando el proyecto tenga margen operativo, migrar a una casilla funcional compartida tipo `no-reply@...`, `campus@...` o equivalente.
