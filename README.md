# IA Local Segura en Apple — landing del ebook

Landing de venta del ebook **IA Local Segura en Apple**, publicada en GitHub Pages.

- **URL:** https://keepsync-hub.github.io/apple-ia-local-segura/
- **Lo que se vende acá es el ebook**, y nada más: enseña a dejar andando, dentro de un Mac mini,
  un agente que recuerda, aprende la forma de trabajar del equipo y da seguimiento —con el modelo
  y la memoria en el disco cifrado del equipo, sin salir a internet y apoyándose en los controles
  que ya pide ISO/IEC 27001.
- **Oferta:** las primeras **20 reservas** pagan **USD 25**; después el ebook queda en **USD 50**.
- **La reserva y el pago van seguidos.** Al enviar el formulario se guarda el registro y la
  misma página manda a pagar a Webpay, sin salir del sitio. El correo con el mismo link queda
  de respaldo para quien prefiera pagar después, con 48 h de plazo.
- **El Mac mini preconfigurado no se vende en la página: se cotiza.** Tiene su propia sección
  (`#equipo`) con el precio de referencia —USD 2.500, con el equipo incluido— y un botón de
  WhatsApp. Esa venta es conversada y **no toca n8n**.

Comparte la máquina con la landing de [IA Segura ISO 27001](https://github.com/keepsync-hub/ebook-ia-segura-iso27001):
mismo flujo de reserva y mismo despliegue. Cambian el contenido, la paleta y las rutas del webhook.

## Cómo se describe el agente

El agente se cuenta **solo por sus beneficios** —recuerda, aprende tu forma de trabajar, da
seguimiento— con un ejemplo concreto de oficina en cada uno, y el cierre que lo diferencia: un
chatbot público olvida y aprende para su dueño; este recuerda y aprende para quien lo usa, y lo
aprendido no sale del equipo. **No se nombra ningún proveedor de modelo ni proyecto de origen**,
ni en la página ni acá. Si alguna vez hay que cambiar la pieza de software que hay debajo, la
página no se toca.

## Cómo se le habla a quien lee

**Se tutea.** La página, los mensajes del formulario y el correo de confirmación tratan de **tú**
a quien reserva: «reserva tu copia», «te llega por correo», «escríbenos». Conviene revisarlo al
editar, porque el registro se rompe con una sola frase suelta en usted. La única aparición
deliberada de «usted» es el ejemplo del pilar *Aprende tu forma de trabajar* («a los clientes se
les trata de usted»): ahí la palabra es el criterio que el agente aprende, no la forma de hablarle
a quien lee.

## Los precios que aparecen

| Precio | Qué es | Cómo se cobra |
|---|---|---|
| USD 25 / USD 50 | El ebook (lanzamiento / normal) | Formulario → n8n → link de pago por correo |
| USD 2.500 | El Mac mini preconfigurado, con el equipo incluido | WhatsApp, fuera de la página |
| USD 90 al mes | Plan gestionado opcional, con cobertura AppleCare | WhatsApp |

La sección `#equipo` justifica los USD 2.500 en una línea: contra un piso declarado de **USD 800
al mes** que cuesta esa carga administrativa, el equipo se paga **al cuarto mes** (2.500 ÷ 800 =
3,1 meses, así que la frase es exacta). **Si cambia alguno de esos dos números hay que rehacer esa
línea.** La comparación es contra el costo del trabajo repetitivo, no contra despedir a nadie: la
página sostiene que el agente devuelve horas, y conviene no romper esa coherencia al editar.

## Cómo está armado

HTML, CSS y JavaScript estáticos, sin build ni dependencias. La página no carga **nada**
desde dominios externos: ni fuentes, ni frameworks, ni analítica. El único request que sale
es al webhook de n8n.

```
docs/
  index.html          la página completa (la portada del ebook es un SVG inline)
  assets/styles.css   estilos
  assets/reserva.js   contador de cupos + envío del formulario
  assets/og.png       imagen para compartir en redes (1200×630, generada como captura de un HTML)
  assets/mac-mini-*.jpg  las tres fotos del equipo
  .nojekyll           por si alguna vez se vuelve a servir desde una rama
.github/workflows/
  pages.yml           empaqueta docs/ y lo publica en Pages
n8n/
  reserva-ebook.workflow.js   código SDK del workflow, fuente de verdad
```

## El lenguaje visual

La referencia es **apple.com**: fondo blanco alternado con gris `#f5f5f7`, texto `#1d1d1f`,
azul `#0071e3` para la acción, naranjo `#bf4800` para el «Nuevo», botones en píldora,
esquinas de 18 px y titulares grandes con tracking negativo.

La tipografía es la pila del sistema (`-apple-system` → SF Pro en un Mac, Helvetica o Arial
en el resto). Se eligió así por dos razones: en el público de esta página —gente frente a un
Mac— se ve exactamente como en apple.com, y no obliga a pedirle una fuente a un dominio
externo, que es justo lo que la página promete no hacer.

### Las fotos y el color de las bandas

Cada foto del Mac mini trae su propio fondo, y la banda que la contiene usa **ese mismo color**,
así el equipo aparece recortado sobre la página, sin recuadro ni borde:

| Foto | Fondo | Dónde va |
|---|---|---|
| `mac-mini-superior.jpg` | `#f5f5f7` | Hero, dentro del recuadro gris |
| `mac-mini-frente.jpg` | `#fcf7f4` | Banda «Por qué un Mac mini» (`.band-foto`) |
| `mac-mini-escritorio.jpg` | `#f8f7f3` | Banda del caso real (`.band-foto-2`) |

Los tres colores están en las variables `--bg-alt`, `--bg-foto` y `--bg-foto-2`. **Si se
reemplaza una foto hay que actualizar su variable**, o aparecerá el recuadro.

Son imágenes de producto de Apple Inc., usadas para identificar el equipo; el pie de la página
lo dice. Antes de una campaña pagada conviene revisar las condiciones de uso de material de
Apple, o reemplazarlas por fotos propias del equipo que se entrega.

## Publicar

La publicación va por **GitHub Actions**: el workflow `.github/workflows/pages.yml` empaqueta
`docs/` y lo despliega en Pages. Cada push a `main` que toque `docs/` republica solo; también
se puede lanzar a mano desde la pestaña Actions.

Para activarlo la primera vez hay que dejar **Settings → Pages → Source: GitHub Actions**
(una sola vez; si quedara en "Deploy from a branch", el workflow falla al desplegar).

Para trabajar localmente:

```bash
python3 -m http.server 8099 -d docs
```

## El backend de las reservas

Un solo workflow de n8n, **Ebook IA Local Segura en Apple · Reservas (GitHub Pages)**, con dos rutas:

| Ruta | Método | Devuelve |
|---|---|---|
| `/webhook/ebook-apple-ia/cupos` | GET | `{ total, tomados, restantes, precio, precio_normal }` |
| `/webhook/ebook-apple-ia/reserva` | POST | `{ ok, estado, cupo, restantes, link_pago }` |

Las reservas se guardan en la Data Table `reservas_ebook_apple_ia`, que es la fuente de verdad.

### Los tres estados de una reserva

| Estado | Cuándo | Qué recibe la persona |
|---|---|---|
| `reservado` | Quedan cupos | Cupo numerado, salto al pago en la página y el link por correo |
| `ya_reservado` | El correo ya estaba | Su cupo original y el mismo salto al pago |
| `lista_espera` | Los 20 están tomados | Aviso de que le escribimos al salir a USD 50. **Sin salto al pago**: todavía no hay nada que cobrar, y por eso `link_pago` viene en `null` |

El guardado usa **upsert por correo**, así que el mismo correo dos veces actualiza su fila y
nunca duplica. El nodo `Responder al navegador` va después de guardar y antes de Gmail: la
persona recibe su confirmación rápido y un fallo de correo no le cuesta la reserva —y ahora
tampoco le cuesta el pago, porque el link viaja en la respuesta del webhook, no solo en el correo.

### El salto al pago

Cuando la reserva queda confirmada, `reserva.js` inserta un botón **Pagar ahora** bajo el
formulario y salta solo al link a los 4 segundos. Ese retraso es a propósito: da tiempo a leer
que el cupo quedó tomado y no empuja a nadie sin aviso; si el salto automático falla o el
navegador lo bloquea, el botón sigue ahí.

El link sale de `data.link_pago`, que devuelve el webhook. `reserva.js` guarda además una copia
en la constante `LINK_PAGO` como respaldo, y solo acepta la del servidor si viene por `https://`.
**Si cambia el link de pago hay que cambiarlo en los dos lugares**: `LINK_PAGO` en
`n8n/reserva-ebook.workflow.js` (que alimenta el correo y la respuesta) y `LINK_PAGO` en
`docs/assets/reserva.js` (el respaldo).

### Anti-spam

El formulario lleva un campo trampa `website`, oculto por CSS y fuera del foco. El webhook
descarta la petición antes de ejecutar un solo nodo si ese campo viene con algo o si el
correo no tiene forma de correo (`onlyRunIf`), y además ignora bots y sólo acepta peticiones
desde `https://keepsync-hub.github.io`.

### Contacto directo

La página lleva una burbuja fija de WhatsApp al número de contacto
(`+56 9 9412 0579`, enlace `wa.me` con mensaje prellenado). Es también el
respaldo cuando el formulario falla, cuando el visitante tiene JavaScript
desactivado, y la vía para pedir que se borren los datos.

Hay **tres mensajes prellenados distintos** sobre el mismo número, para saber en la bandeja
con qué intención llega cada persona:

| Mensaje | Dónde está |
|---|---|
| «tengo una consulta» | Burbuja fija, pie de página, cierre y el `noscript` de los formularios |
| «quiero el Mac mini configurado con el agente (USD 2.500)» | Botón de la sección `#equipo` y la última pregunta del FAQ |
| «quiero saber del plan gestionado» | Enlace del plan, dentro de la sección `#equipo` |

Los tres se generan con `urllib.parse.quote` para no equivocarse con los acentos.

### Si n8n no responde

La página no se rompe. El contador se queda con el texto estático del HTML ("Solo 20 copias
a este precio") y el formulario sigue enviable. Un fallo al enviar deja el formulario
reenviable y ofrece el WhatsApp del autor como respaldo.

## Estado

**La landing está publicada y el backend está montado y activo.** El workflow
`Ebook IA Local Segura en Apple · Reservas (GitHub Pages)` corre en n8n cloud:

| Pieza | Valor |
|---|---|
| Workflow | `l3iJs9bH4XpqQAWh` — [abrir en n8n](https://keepsync-hub.app.n8n.cloud/workflow/l3iJs9bH4XpqQAWh) |
| Data Table | `reservas_ebook_apple_ia` → `KPRHxEzOjaL3txG3` |
| Credencial de correo | Gmail OAuth2 `cYhcyiH1LcyrXUWz`, remitente «IA Local Segura en Apple» |
| Link de pago | `https://www.webpay.cl/form-pay/420828` |

El archivo `n8n/reserva-ebook.workflow.js` sigue siendo la fuente de verdad: es el
código con el que se creó el workflow, con el ID de la tabla ya pegado en `TABLA`.
**Si se edita el workflow desde la interfaz de n8n, hay que reflejar el cambio acá**,
o la próxima importación pisa lo editado.

### Cómo se verificó

Primero ejecutando el workflow desde el servidor y después **por HTTP contra el webhook de
producción**, que es la ruta que usa la landing de verdad:

| Prueba | Resultado |
|---|---|
| `GET /cupos` | `{ total: 20, tomados: 0, restantes: 20, precio: 25, precio_normal: 50 }` |
| `POST /reserva` con la trampa `website` llena | `200 {"message":"Webhook call received"}` y **ninguna fila**: el filtro descarta antes de ejecutar un nodo |
| `POST /reserva` con un correo mal formado | Igual: descartado |
| `POST /reserva` válido | `{ ok: true, estado: "reservado", cupo: 1, restantes: 19, link_pago: "…420828" }`, fila guardada y correo enviado (Gmail lo devolvió con etiqueta `SENT`) |

Ese `link_pago` de la respuesta es el que la página usa para mandar a pagar en el acto. Las
filas de prueba se borraron después y el contador quedó en 20 de 20.

**Si pruebas el webhook con `curl` y te responde `403 Authorization data is wrong!`, no está
roto**: el webhook lleva `ignoreBots: true` y el `User-Agent` de curl cae como bot. Con un
`User-Agent` de navegador responde 200 normal:

```bash
curl -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15" \
  -H "Origin: https://keepsync-hub.github.io" \
  https://keepsync-hub.app.n8n.cloud/webhook/ebook-apple-ia/cupos
```

### Lo único que no es automático

El pago **se valida a mano**: el formulario de Webpay no avisa de vuelta a n8n, así que
`pagado` se marca a mano y **un cupo reservado y no pagado queda tomado** hasta que alguien
lo libere. Con 20 cupos eso se administra mirando la tabla; si el volumen crece, ahí sí
conviene el workflow de conciliación que está más abajo.

Para borrar filas de prueba hay un workflow desechable archivado en n8n
(**Limpieza · filas de prueba (apple-ia)**), que borra lo que tenga `origen = prueba-tecnica`
—un valor que ninguna reserva real puede traer, porque la landing manda `hero` o `cierre`—.
Está archivado a propósito: para usarlo hay que desarchivarlo primero.

## Pendiente (fase 2)

- **Embudo propio para el equipo.** Hoy la venta de USD 2.500 sale por WhatsApp y no queda
  registrada en ninguna parte. Medirla exigiría un segundo workflow y otra Data Table; se dejó
  fuera a propósito, porque es una venta conversada y el formulario no la mejora.
- **Fotos propias del equipo** en vez de las imágenes de producto de Apple, antes de invertir
  en publicidad.
- **Declarar entrega y plazo** en la página. Hoy dice "coordinamos entrega y plazo por WhatsApp",
  que es honesto pero convierte peor que un plazo escrito.
- Espejo de la Data Table a un Google Sheet, con un workflow programado aparte. Queda fuera
  del camino de la reserva a propósito: un fallo de credencial ahí no le cuesta una venta a
  nadie. Requiere crear una credencial de Google Sheets en n8n.
- **Conciliación de pagos:** marcar `pagado` y liberar los cupos vencidos a las 48 h. Hoy es
  manual y no se puede automatizar del todo: el formulario de pago no notifica a n8n. Lo que sí
  se puede hacer es un workflow programado que libere los cupos con más de 48 h y `pagado = false`,
  dejando la confirmación del pago como el único paso a mano.
