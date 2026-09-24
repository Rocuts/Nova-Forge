// Geometría de la home, medida sobre las imágenes fuente en su espacio de
// píxeles de 1536×1024 (traspaso §3; cada coordenada se verificó dibujándola
// sobre su imagen). Las superposiciones SVG usan este mismo espacio como
// viewBox, dentro de FocalCover, así que coinciden con la imagen en cualquier
// proporción de pantalla. No editar sin volver a medir.

export const IMAGE_WIDTH = 1536
export const IMAGE_HEIGHT = 1024
export const VIEWBOX = "0 0 1536 1024"

/**
 * Portada (`relieve`): sendero en zigzag que sube por el macizo de la derecha
 * hasta la cumbre. Se dibuja con `strokeLinecap="butt"`: con `round`, un trazo
 * de longitud 0 ya pinta un punto visible.
 */
export const ROUTE_PATH = "M 1040 1024 C 1049.7 1014.7 1091 986.7 1098 968 C 1105 949.3 1074 929 1082 912 C 1090 895 1125.7 882.7 1146 866 C 1166.3 849.3 1197.3 831 1204 812 C 1210.7 793 1181.3 769.3 1186 752 C 1190.7 734.7 1218.7 722.7 1232 708 C 1245.3 693.3 1264 680 1266 664 C 1268 648 1243.3 629 1244 612 C 1244.7 595 1261.3 577 1270 562 C 1278.7 547 1295 536 1296 522 C 1297 508 1278.2 494.8 1276 478 C 1273.8 461.2 1281.8 430.5 1283 421"
export const ROUTE_SUMMIT = { x: 1283, y: 421 } as const
/**
 * Fracción de la longitud de `ROUTE_PATH` (756 unidades) desde la que la ruta
 * queda por encima de y = 502, el 49 % de la imagen: en la banda vertical de la
 * portada, la máscara `.hero-route` (globals.css) deja ver solo lo que sube de
 * ahí (el 11 % final; el 4 % sin atenuar, por encima de y = 451). Medido
 * muestreando el trazado: el cruce está en 0,8885 (en 0,898 con el zoom de
 * 1,08 que hay en scrub cuando el dibujo termina).
 */
export const ROUTE_BAND_VISIBLE_FROM = 0.88

/**
 * Capacidades (`lamina`), en el orden de `dict.services.items`. Todos caen
 * dentro de x 490–1060: un recorte vertical centrado los muestra siempre.
 */
export const CAPABILITY_NODES = [
  { x: 490, y: 190 }, { x: 640, y: 128 }, { x: 700, y: 340 }, { x: 990, y: 330 },
  { x: 860, y: 470 }, { x: 1060, y: 580 }, { x: 800, y: 700 }, { x: 610, y: 620 },
] as const

/**
 * Del papel al dato (`expediente`, página izquierda), en el orden de
 * `dict.dossier.fields`. Cada recuadro envuelve el valor tecleado; la página
 * está levemente inclinada, así que los valores quedan unos 12 px por encima
 * de su etiqueta.
 */
export const DOSSIER_FIELDS = [
  { x: 448, y: 265, width: 103, height: 23 }, // Nombre
  { x: 452, y: 336, width: 101, height: 23 }, // Fecha de nacimiento
  { x: 454, y: 384, width: 101, height: 23 }, // Domicilio
  { x: 455, y: 432, width: 101, height: 23 }, // Correo electrónico
  { x: 458, y: 522, width: 104, height: 23 }, // Tipo de trámite
  { x: 460, y: 572, width: 103, height: 23 }, // Fecha de solicitud
] as const
