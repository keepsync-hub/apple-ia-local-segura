# IA Local Segura en Apple — landing de lanzamiento

Landing de lanzamiento del ebook **IA Local Segura en Apple**, publicada en GitHub Pages.

- **URL:** https://keepsync-hub.github.io/apple-ia-local-segura/
- **De qué trata:** cómo instalar IA local en un **Mac mini** —el modelo corre dentro del equipo,
  sin salir a internet y sin que un dato deje la empresa—, apoyándose en los controles que ya pide
  ISO/IEC 27001.
- **Dos caminos, una sola página:** montarlo desde cero con el ebook, o pedir un Mac mini
  **100 % configurado** (llegar y usar). El segundo camino se cotiza por WhatsApp, no por el formulario.
- **Oferta:** las primeras **20 reservas** pagan **USD 10**; después el ebook queda en **USD 25**.
- **La landing reserva, no cobra.** El link de pago se manda por correo, con 48 h de plazo.

Es la misma máquina de la landing de [IA Segura ISO 27001](https://github.com/keepsync-hub/ebook-ia-segura-iso27001),
replicada para este ebook: misma estructura, mismo flujo de reserva y mismo despliegue. Cambian el
contenido, la paleta y las rutas del webhook.

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
  .nojekyll           por si alguna vez se vuelve a servir desde una rama
.github/workflows/
  pages.yml           empaqueta docs/ y lo publica en Pages
n8n/
  reserva-ebook.workflow.js   código SDK del workflow, fuente de verdad
```

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
| `/webhook/ebook-apple-ia/reserva` | POST | `{ ok, estado, cupo, restantes }` |

Las reservas se guardan en la Data Table `reservas_ebook_apple_ia`, que es la fuente de verdad.

### Los tres estados de una reserva

| Estado | Cuándo | Qué recibe la persona |
|---|---|---|
| `reservado` | Quedan cupos | Cupo numerado y el link de pago, con 48 h |
| `ya_reservado` | El correo ya estaba | Su cupo original y el link de pago de nuevo |
| `lista_espera` | Los 20 están tomados | Aviso de que le escribimos al salir a USD 25 |

El guardado usa **upsert por correo**, así que el mismo correo dos veces actualiza su fila y
nunca duplica. El nodo `Responder al navegador` va después de guardar y antes de Gmail: la
persona recibe su confirmación rápido y un fallo de correo no le cuesta la reserva.

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

Hay **dos mensajes prellenados distintos** sobre el mismo número: el genérico
("tengo una consulta") en la burbuja, el pie y el bloque de contacto; y uno de
cotización ("quiero cotizar un Mac mini ya configurado con IA local") en la
tarjeta llave en mano de la sección **Dos caminos** y en su pregunta del FAQ.
Así se distingue en la bandeja quién viene a preguntar y quién a comprar el equipo.

### Si n8n no responde

La página no se rompe. El contador se queda con el texto estático del HTML ("Solo 20 copias
a este precio") y el formulario sigue enviable. Un fallo al enviar deja el formulario
reenviable y ofrece el WhatsApp del autor como respaldo.

## Estado

La página está lista para publicar. El backend **todavía no está montado en n8n**: el archivo
`n8n/reserva-ebook.workflow.js` es el código del workflow listo para importar, pero antes hay
que dejar dos cosas resueltas, las dos marcadas como `PENDIENTE` en el archivo (y en una nota
adhesiva dentro del propio workflow):

1. **Crear la Data Table** `reservas_ebook_apple_ia` con las columnas del `ESQUEMA` y pegar su ID
   en la constante `TABLA`.
2. **Poner el link de pago** en `LINK_PAGO`, al inicio del nodo **Decidir cupo y correo**. Mientras
   diga `PENDIENTE`, el correo de confirmación manda a la gente a una URL que no existe.

Ahí mismo viven los precios y el plazo de 48 h, por si hay que moverlos.

Mientras el workflow no esté activo, la landing funciona igual: el contador se queda con el texto
estático y el formulario avisa que no se pudo registrar la reserva, ofreciendo el WhatsApp del autor.

## Pendiente (fase 2)

- Espejo de la Data Table a un Google Sheet, con un workflow programado aparte. Queda fuera
  del camino de la reserva a propósito: un fallo de credencial ahí no le cuesta una venta a
  nadie. Requiere crear una credencial de Google Sheets en n8n.
- Conciliación de pagos: marcar `pagado` y liberar los cupos vencidos a las 48 h.
