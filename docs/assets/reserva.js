/* Reservas del ebook "IA Local Segura en Apple".
 *
 * Un solo workflow de n8n atiende las dos rutas:
 *   GET  /cupos   -> { total, restantes, precio, precio_normal }  (contador del hero y del cierre)
 *   POST /reserva -> { ok, estado, cupo, restantes }              (la reserva)
 *
 * Al reservar, la persona pasa derecho a pagar: se guarda el registro y la página
 * la manda al link de pago sin salir de acá. El correo con el mismo link queda como
 * respaldo para quien prefiera pagar después, dentro de las 48 h.
 *
 * Regla de oro de esta página: si n8n no responde, la página NO se ve rota.
 * El contador se queda con el texto que ya venía en el HTML y el formulario
 * sigue enviable — quien reserva no tiene por qué enterarse de nuestros problemas.
 */
(function () {
  'use strict';

  var BASE         = 'https://keepsync-hub.app.n8n.cloud/webhook/ebook-apple-ia';
  var URL_CUPOS    = BASE + '/cupos';
  var URL_RESERVA  = BASE + '/reserva';

  /* Respaldo del link de pago. Lo normal es que n8n lo devuelva en `link_pago`;
     esta copia existe para que el salto al pago no dependa de esa respuesta. */
  var LINK_PAGO   = 'https://www.webpay.cl/form-pay/420828';
  var ESPERA_PAGO = 4000;

  var TOTAL         = 20;
  var PRECIO        = 25;
  var PRECIO_NORMAL = 50;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var forms    = Array.prototype.slice.call(document.querySelectorAll('form.reserva'));
  var contadores = Array.prototype.slice.call(document.querySelectorAll('[data-cupos]'));

  /* ─────────────────────────  utilidades  ───────────────────────── */

  function pedir(url, opciones, ms) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var corte = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    if (ctrl) opciones.signal = ctrl.signal;
    return fetch(url, opciones)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .finally(function () { clearTimeout(corte); });
  }

  function estado(form, tono, texto) {
    var p = form.querySelector('.form-status');
    if (!p) return;
    p.className = 'form-status is-on is-' + tono;
    p.textContent = texto;
  }

  function limpiarEstado(form) {
    var p = form.querySelector('.form-status');
    if (p) { p.className = 'form-status'; p.textContent = ''; }
  }

  /* ─────────────────────────  contador de cupos  ───────────────────────── */

  function pintarCupos(restantes) {
    var texto;
    var agotado = restantes <= 0;

    if (agotado) {
      texto = 'Las ' + TOTAL + ' copias a USD ' + PRECIO + ' ya están tomadas. Precio actual: USD ' + PRECIO_NORMAL + '.';
    } else if (restantes === 1) {
      texto = 'Queda 1 copia de ' + TOTAL + ' a USD ' + PRECIO + '.';
    } else {
      texto = 'Quedan ' + restantes + ' de ' + TOTAL + ' copias a USD ' + PRECIO + '.';
    }

    contadores.forEach(function (el) { el.textContent = texto; });

    if (agotado) {
      forms.forEach(function (form) {
        var btn = form.querySelector('.btn-primary');
        if (btn) btn.textContent = 'Anotarme en la lista de espera';
        var micro = form.querySelector('.microcopy');
        if (micro) {
          micro.innerHTML = '<b>El precio de lanzamiento se agotó.</b> Le avisamos apenas el ebook esté ' +
                            'disponible a su precio normal de USD ' + PRECIO_NORMAL + '.';
        }
      });
    }
  }

  function cargarCupos() {
    pedir(URL_CUPOS, { method: 'GET', headers: { Accept: 'application/json' } }, 4000)
      .then(function (data) {
        var restantes = Number(data && data.restantes);
        if (isFinite(restantes)) pintarCupos(restantes);
      })
      .catch(function () {
        /* Silencio deliberado: se queda el texto estático del HTML. */
      });
  }

  /* ─────────────────────────  validación  ───────────────────────── */

  function validar(form) {
    var malos = [];

    ['nombre', 'email'].forEach(function (campo) {
      var input = form.elements[campo];
      if (!input) return;
      var valor = input.value.trim();
      var ok = campo === 'email' ? EMAIL_RE.test(valor) : valor.length > 1;
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (!ok) malos.push(input);
    });

    var consent = form.elements.consentimiento;
    if (consent && !consent.checked) malos.push(consent);

    if (malos.length) {
      malos[0].focus();
      estado(form, 'err', malos[0] === consent
        ? 'Necesitamos su autorización para escribirle y coordinar el pago.'
        : 'Revise los campos marcados: falta completar alguno o el correo no es válido.');
      return false;
    }
    return true;
  }

  /* ─────────────────────────  envío  ───────────────────────── */

  var MENSAJES = {
    reservado: function (d) {
      return 'Listo. Reservó el cupo #' + d.cupo + ' de ' + TOTAL + ' a USD ' + PRECIO +
             '. Complete el pago acá abajo; el link también le llega por correo.';
    },
    ya_reservado: function (d) {
      return 'Este correo ya tenía reservado el cupo #' + d.cupo +
             '. Puede completar el pago acá mismo.';
    },
    lista_espera: function () {
      return 'Los ' + TOTAL + ' cupos a USD ' + PRECIO + ' ya estaban tomados, así que lo dejamos en la ' +
             'lista de espera: le avisamos apenas el ebook salga a su precio normal de USD ' + PRECIO_NORMAL + '.';
    }
  };

  /* ─────────────────────────  salto al pago  ─────────────────────────
     La reserva ya quedó guardada: de acá la persona se va a pagar. El botón
     aparece primero y el salto ocurre unos segundos después, para que alcance a
     leer que su cupo quedó tomado y para no empujar a nadie sin aviso. Si el
     salto automático falla o el navegador lo bloquea, el botón sigue ahí. */

  function enlacePago(data) {
    var url = data && data.link_pago;
    return (typeof url === 'string' && url.indexOf('https://') === 0) ? url : LINK_PAGO;
  }

  function irAlPago(form, url) {
    var p = form.querySelector('.form-status');
    if (!p || !p.parentNode) return;

    var caja = document.createElement('div');
    caja.className = 'pago';

    var boton = document.createElement('a');
    boton.className = 'btn-primary pago-btn';
    boton.href = url;
    boton.textContent = 'Pagar ahora USD ' + PRECIO;

    var aviso = document.createElement('p');
    aviso.className = 'pago-aviso';

    caja.appendChild(boton);
    caja.appendChild(aviso);
    p.parentNode.insertBefore(caja, p.nextSibling);
    boton.focus();

    var quedan = Math.round(ESPERA_PAGO / 1000);

    function pintar() {
      aviso.textContent = quedan > 0
        ? 'Lo llevamos al pago en ' + quedan + '…'
        : 'Abriendo el pago…';
    }
    pintar();

    var reloj = setInterval(function () {
      quedan -= 1;
      pintar();
      if (quedan > 0) return;
      clearInterval(reloj);
      window.location.assign(url);
    }, 1000);

    /* Si se adelanta y hace clic, no hay que empujarlo dos veces. */
    boton.addEventListener('click', function () { clearInterval(reloj); });
  }

  function enviar(form) {
    var btn = form.querySelector('.btn-primary');
    var textoBtn = btn ? btn.textContent : '';

    if (btn) { btn.disabled = true; btn.textContent = 'Reservando…'; }
    estado(form, 'wait', 'Guardando su reserva…');

    var cuerpo = {
      nombre:         form.elements.nombre.value.trim(),
      email:          form.elements.email.value.trim().toLowerCase(),
      consentimiento: form.elements.consentimiento.checked ? 'si' : 'no',
      website:        form.elements.website ? form.elements.website.value : '',
      origen:         form.dataset.origen || 'landing'
    };

    pedir(URL_RESERVA, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(cuerpo)
    }, 15000)
      .then(function (data) {
        var arma = data && MENSAJES[data.estado];
        if (!arma) throw new Error('respuesta inesperada');

        estado(form, 'ok', arma(data));

        /* La reserva quedó: se cierra el formulario para que nadie la mande dos veces. */
        Array.prototype.forEach.call(form.elements, function (el) { el.disabled = true; });
        if (btn) btn.textContent = 'Reserva registrada';

        if (typeof data.restantes === 'number') pintarCupos(data.restantes);

        /* En lista de espera todavía no hay nada que cobrar. */
        if (data.estado !== 'lista_espera') irAlPago(form, enlacePago(data));
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = textoBtn; }
        estado(form, 'err',
          'No pudimos registrar la reserva. Vuelva a intentarlo en un momento, o escríbanos por ' +
          'WhatsApp con el botón verde y la tomamos a mano.');
      });
  }

  /* ─────────────────────────  arranque  ───────────────────────── */

  forms.forEach(function (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      limpiarEstado(form);
      if (validar(form)) enviar(form);
    });

    form.addEventListener('input', function (ev) {
      if (ev.target.getAttribute('aria-invalid') === 'true') {
        ev.target.setAttribute('aria-invalid', 'false');
      }
    });
  });

  cargarCupos();
})();
