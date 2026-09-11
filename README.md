# IA Local Segura en Apple — landing del ebook

Landing de venta del ebook **IA Local Segura en Apple**, publicada en GitHub Pages.

- **URL:** https://keepsync-hub.github.io/apple-ia-local-segura/
- **Lo que se vende acá es el ebook**, y nada más: enseña a dejar andando, dentro de un Mac mini,
  un agente que recuerda, aprende la forma de trabajar del equipo y da seguimiento —con el modelo
  y la memoria en el disco cifrado del equipo, sin salir a internet y apoyándose en los controles
  que ya pide ISO/IEC 27001.
- **Oferta:** las primeras **20 reservas** pagan **USD 25**; después el ebook queda en **USD 50**.
- **La landing reserva, no cobra.** El link de pago se manda por correo, con 48 h de plazo.
- **El Mac mini preconfigurado no se vende en la página: se cotiza.** Tiene su propia sección
  (`#equipo`) con el precio de referencia —USD 2.500, con el equipo incluido— y un botón de
  WhatsApp. Esa venta es conversada y **no toca n8n**.

Comparte la máquina con la landing de [IA Segura ISO 27001](https://github.com/keepsync-hub/ebook-ia-segura-iso27001):
mismo flujo de reserva y mismo despliegue. Cambian el contenido, la paleta y las rutas del webhook.

## Cómo se describe el agente

El agente se cuenta **solo por sus beneficios** —recuerda, aprende su forma de trabajar, da
seguimiento— con un ejemplo concreto de oficina en cada uno, y el cierre que lo diferencia: un
chatbot público olvida y aprende para su dueño; este recuerda y aprende para quien lo usa, y lo
aprendido no sale del equipo. **No se nombra ningún proveedor de modelo ni proyecto de origen**,
ni en la página ni acá. Si alguna vez hay que cambiar la pieza de software que hay debajo, la
página no se toca.

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
| `/webhook/ebook-apple-ia/reserva` | POST | `{ ok, estado, cupo, restantes }` |

Las reservas se guardan en la Data Table `reservas_ebook_apple_ia`, que es la fuente de verdad.

### Los tres estados de una reserva

| Estado | Cuándo | Qué recibe la persona |
|---|---|---|
| `reservado` | Quedan cupos | Cupo numerado y el link de pago, con 48 h |
| `ya_reservado` | El correo ya estaba | Su cupo original y el link de pago de nuevo |
| `lista_espera` | Los 20 están tomados | Aviso de que le escribimos al salir a USD 50 |

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

La página está lista para publicar. El backend **todavía no está montado en n8n**: el archivo
`n8n/reserva-ebook.workflow.js` es el código del workflow listo para importar, pero antes hay
que dejar dos cosas resueltas, las dos marcadas como `PENDIENTE` en el archivo (y en una nota
adhesiva dentro del propio workflow):

1. **Crear la Data Table** `reservas_ebook_apple_ia` con las columnas del `ESQUEMA` y pegar su ID
   en la constante `TABLA`.
2. **Poner el link de pago** en `LINK_PAGO`, al inicio del nodo **Decidir cupo y correo**. Mientras
   diga `PENDIENTE`, el correo de confirmación manda a la gente a una URL que no existe.

Ahí mismo viven los precios del ebook (`PRECIO = 25`, `PRECIO_NORMAL = 50`) y el plazo de 48 h.
Ojo: **los precios están escritos dentro de strings de código** (`CODIGO_DECIDIR` y `CODIGO_CUPOS`),
y además en el asunto y el botón del correo. Si se mueven, hay que moverlos en los cuatro lugares y
también en `docs/assets/reserva.js`, que los repite como respaldo para cuando n8n no responde.

Mientras el workflow no esté activo, la landing funciona igual: el contador se queda con el texto
estático y el formulario avisa que no se pudo registrar la reserva, ofreciendo el WhatsApp.
**La venta del equipo no depende de nada de esto**: sale por WhatsApp y no toca n8n.

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
- Conciliación de pagos: marcar `pagado` y liberar los cupos vencidos a las 48 h.
