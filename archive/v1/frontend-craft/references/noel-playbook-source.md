# Frontend Craft Playbook

**Criterio, sistema y proceso para construir interfaces de nivel producto**

Versión 2.0 · octubre 2026 · Autor del criterio: Noel Santiago Méndez Jaimes (UNAB)

---

## Índice

0. [Cómo usar este documento](#0-cómo-usar-este-documento)
1. [Filosofía](#1-filosofía)
2. [Lo que se rechaza y por qué](#2-lo-que-se-rechaza-y-por-qué)
3. [Proceso de trabajo](#3-proceso-de-trabajo)
4. [Sistema de diseño](#4-sistema-de-diseño)
5. [Materiales: Liquid Glass y profundidad](#5-materiales-liquid-glass-y-profundidad)
6. [Componentes y estados](#6-componentes-y-estados)
7. [Movimiento](#7-movimiento)
8. [Visualización de datos](#8-visualización-de-datos)
9. [Copy y escritura de interfaz](#9-copy-y-escritura-de-interfaz)
10. [Rendimiento](#10-rendimiento)
11. [Accesibilidad](#11-accesibilidad)
12. [Responsive y plataformas](#12-responsive-y-plataformas)
13. [Control de calidad](#13-control-de-calidad)
14. [Casos de estudio](#14-casos-de-estudio)
15. [Historial de feedback convertido en reglas](#15-historial-de-feedback-convertido-en-reglas)
16. [Skills: cuáles usar, cuándo y qué filtrar](#16-skills-cuáles-usar-cuándo-y-qué-filtrar)
17. [Herramientas y entrega](#17-herramientas-y-entrega)
18. [Bloque de configuración para el agente](#18-bloque-de-configuración-para-el-agente)
19. [Checklist final](#19-checklist-final)
20. [Puesta en marcha en Claude Code](#20-puesta-en-marcha-en-claude-code)
- [Anexo A. Auditoría de la guía de Escala (versión 1)](#anexo-a-auditoría-de-la-guía-de-escala-versión-1)
- [Anexo B. Tokens de Escala como referencia de nivel](#anexo-b-tokens-de-escala-como-referencia-de-nivel)

---

## 0. Cómo usar este documento

### 0.1 Para qué existe

Este documento transfiere una forma de trabajar el frontend. Está escrito para que otra instancia de Claude (o cualquier agente de diseño y código) produzca interfaces con el mismo nivel de exigencia sin haber vivido las rondas de corrección que lo originaron. Reúne:

- El criterio: qué se considera calidad y qué se rechaza, con la razón de cada rechazo.
- El sistema: cómo se definen tokens, materiales, componentes, estados y movimiento.
- El proceso: cómo se recibe un brief, cómo se itera por rondas, cómo se verifica y cómo se informa.
- Los casos reales: cinco proyectos con lo que funcionó, lo que falló y la regla que dejó cada error.
- Las skills: cuáles cargar, en qué orden y qué partes de cada una se filtran.

### 0.2 Orden de lectura recomendado

| Necesidad | Secciones |
|---|---|
| Entender el criterio antes de diseñar | 1, 2 |
| Empezar un proyecto nuevo | 3, 4, 5 |
| Construir componentes y pantallas | 6, 7, 8, 9 |
| Verificar antes de entregar | 10, 11, 12, 13 |
| Aprender de errores reales | 14, 15 |
| Configurar el agente | 16, 17, 18 |
| Instalar todo en Claude Code paso a paso | 20 |
| Revisión rápida | 19 |
| Auditoría de la guía anterior y tokens de referencia | Anexos A y B |

### 0.3 Nivel de obligatoriedad

| Marca | Significado |
|---|---|
| **DEBE** | Regla dura. Incumplirla es un defecto, aunque el resultado "se vea bien". |
| **DEBERÍA** | Valor por defecto. Se puede romper con una razón escrita en `DESIGN.md`. |
| **PUEDE** | Opción válida según el modo de superficie y el brief. |

### 0.4 Precedencia cuando algo choca

1. El brief explícito del cliente o del usuario en la ronda actual.
2. Preferencias del cliente registradas en rondas anteriores (`DESIGN.md`, historial).
3. Este documento.
4. Las skills cargadas (son criterio, no plantilla; se filtran según la sección 16).
5. Valores por defecto de librerías y frameworks (nunca se aceptan sin revisarlos).

Excepción: accesibilidad mínima (sección 11) y no inventar datos (sección 2.1) no se negocian. Si el brief pide algo que las rompe, se señala el conflicto y se propone la alternativa más cercana.

---

## 1. Filosofía

### 1.1 Contrato básico

1. **Decidir, no heredar.** Cada valor visible (fuente, color, radio, sombra, duración, layout) DEBE poder defenderse en una frase. Un valor por defecto que nadie revisó es el origen de todo lo genérico.
2. **Simplicidad no es minimalismo.** Se quita lo innecesario para que el propósito resalte. A veces añadir contexto (una fecha, un dato de progreso, el siguiente paso) simplifica.
3. **La función manda sobre el adorno.** Cristal, desenfoque, brillo, partículas, degradados y animación existen solo si comunican jerarquía, estado, material o una atmósfera elegida para ese producto.
4. **Los detalles invisibles se acumulan.** Anillos de foco, selección de texto, barras de scroll, cifras tabulares, estados vacíos, de error y de carga separan lo construido de lo ensamblado. El usuario no los nota uno por uno; nota la suma.
5. **La frecuencia manda sobre el deleite.** Lo que se usa cien veces al día no se anima. Lo que se ve una vez (landing, acceso, celebración) puede sorprender.
6. **Respuesta inmediata.** Feedback al presionar, continuo durante el gesto e interrumpible siempre.
7. **El brief del cliente gana al gusto propio.** Redirigir un pedido claro hacia la preferencia del agente es un fallo, aunque la preferencia sea mejor.
8. **Comprometerse con un mundo visual.** Entre "refinado y tibio" y "comprometido con una idea", elegir comprometido, dentro de lo que pide el tipo de superficie.
9. **Sin emojis, sin datos inventados, sin copy de relleno.** Siempre.
10. **Menos efectos, mejor ejecutados.** Lo genérico rara vez viene de hacer poco; viene de hacer demasiado a la vez (lección de Operación Cassandra, sección 14.4).

### 1.2 Los ocho principios de Apple, en operativo

| Principio | Cómo se aplica |
|---|---|
| Propósito | Decidir qué no construir. Cada función cuesta tiempo, atención y confianza. |
| Agencia | El usuario controla: deshacer fácil, confirmación solo para lo destructivo e irreversible. Si hay IA, la IA propone y una persona aprueba. |
| Responsabilidad | Actuar en interés del usuario: pedir permisos en el momento justo, explicar qué hace la IA con sus datos. |
| Familiaridad | Lo que se ve igual se comporta igual y vive en el mismo lugar. |
| Flexibilidad | Funciona en todos los anchos objetivo; respeta movimiento reducido, transparencia reducida, alto contraste y zoom al 200 %. |
| Simplicidad | El camino común primero; lo avanzado un nivel más abajo (divulgación progresiva). |
| Craft | Nada es aleatorio: cada espaciado, tiempo y alineación se defiende. |
| Deleite | Es el resultado de los siete anteriores, no confeti añadido encima. |

Cada pantalla DEBE responder cuatro preguntas sin esfuerzo: dónde estoy, qué hay aquí, a dónde puedo ir y cómo salgo.

### 1.3 Modos de superficie

El modo define cómo se ve el éxito. Se decide por pantalla, no por proyecto: una landing y un panel del mismo producto tienen modos distintos.

| Modo | Objetivo del usuario | Cómo se muestra la ambición | Ejemplos |
|---|---|---|---|
| Persuadir | Decidir y actuar | Compromiso, voz, un momento firma | Landing, pricing, campaña |
| Experiencia | Habitar la obra | Atmósfera, escena, narrativa | Acceso de marca, portafolio, juego, 3D |
| Operar | Completar la tarea | Precisión, contención, densidad | Dashboard, admin, CRM, agenda |
| Leer | Entender | Jerarquía, ritmo, medida | Documentación, artículos, reportes |

**Diales por modo** (1 a 10, punto de partida; el brief los sobrescribe):

| Modo | VARIANCE (simetría → asimetría) | MOTION (estático → cinemático) | DENSITY (galería → cabina) |
|---|---|---|---|
| Persuadir | 7 | 6 | 3 |
| Operar | 3 | 3 | 7 |
| Leer | 3 | 2 | 4 |
| Experiencia | 8 | 8 | 2 |

### 1.4 Leyes de UX que sostienen decisiones

| Ley | Implicación concreta |
|---|---|
| Jakob | Respetar convenciones: el usuario pasa la mayor parte de su tiempo en otros productos. Buscador arriba, cerrar arriba a la derecha, logo lleva al inicio. |
| Fitts | Lo frecuente grande y cerca; lo destructivo lejos de lo primario. |
| Hick | Menos opciones a la vez; agrupar y revelar progresivamente. |
| Miller / carga cognitiva | Agrupar en bloques; no pedir que el usuario recuerde datos entre pantallas. |
| Tesler | La complejidad la asume el sistema, no el usuario (autocompletar, valores sugeridos, formatos tolerantes). |
| Doherty | Respuesta perceptible en menos de 400 ms; feedback inmediato aunque el trabajo tarde. |
| Pico-final | Se recuerda el pico y el cierre: cuidar la confirmación de éxito y el final de los flujos. |
| Von Restorff | Un solo acento destaca; diez acentos no destacan nada. |
| Gestalt (proximidad, región común) | Agrupar con espacio antes que con cajas. |
| Estética-usabilidad | Lo bello se percibe más usable. La estética es funcional, no cosmética. |

### 1.5 Gusto entrenado

- El gusto no es preferencia personal: es instinto entrenado viendo trabajo excelente y preguntando por qué funciona.
- Buenos valores por defecto valen más que muchas opciones de configuración.
- Cohesión: nombre, movimiento, color y ritmo cuentan la misma historia. Un personaje puede rebotar; un tablero profesional es nítido y rápido.
- Revisar con ojos frescos (idealmente al día siguiente) y el movimiento en cámara lenta: ahí aparecen los fallos.
- **Prueba del logo:** si al cambiar el logo la página sirve tal cual para cualquier competidor, es genérica.

---

## 2. Lo que se rechaza y por qué

### 2.1 Rechazos explícitos del criterio

| Se rechaza | Por qué | Qué hacer en su lugar |
|---|---|---|
| **Emojis** en UI, títulos, listas, botones, `alt`, commits o copy | Se renderizan distinto en cada sistema, no heredan color ni peso, los lectores de pantalla los leen en voz alta y son la firma número uno de contenido sin cuidado | Íconos de una sola librería o SVG propio, mismo trazo y tamaño óptico. Glifo plano 16–24 px con `currentColor`; íconos con volumen solo a partir de 40 px |
| **La plantilla IA básica** | Comunica que nadie decidió nada | Diseñar desde el producto: una metáfora, un dato propio, una estructura que no sirva para otro producto |
| **Bordes grises de 1 px como único separador** | Aplanan la jerarquía y llenan la pantalla de líneas | Separar primero con espacio, luego con cambio de superficie, luego con sombra suave y al final con un hairline semitransparente |
| **Bordes laterales gruesos de color** en tarjetas o alertas | Recurso de plantilla; compite con el contenido | Icono de estado + color de fondo tenue, o una barra de 3 px solo si marca un estado único en la pantalla (por ejemplo "próxima acción") |
| **Todo en píldora** | Borra la diferencia entre control y contenedor | `999px` solo para controles (botones, chips, selectores). Contenedores con escala de radios |
| **Radios no concéntricos** | Las esquinas anidadas se ven torcidas | Radio interno = radio externo − padding |
| **Decoración sin función**: cristal sobre contenido, blobs sin relación con la marca, animación perpetua en pantallas de trabajo, neón en todo, cursores personalizados | Cuesta rendimiento y legibilidad; el ojo aprende a ignorarlo | Un momento firma por superficie, ejecutado con excelencia |
| **Fondos de cuadrícula** como recurso de fondo | Se perciben genéricos | Escenas con color propio, degradados de la marca, textura con intención. Una pieza puntual con baldosas puede aprobarse; eso no convierte la cuadrícula en fondo |
| **Iniciales como avatar** y colores inventados por entidad | Ruido sin información | Identidad neutra o el logo real; si no hay logo, un pictograma del sector |
| **Datos inventados** (99,9 %, +500 empresas, testimonios, logos de clientes, estadísticas de mercado) | Destruye la credibilidad y puede ser engañoso | Datos simulados coherentes y marcados como tales, o un placeholder evidente: `[métrica pendiente]`, `[testimonio por confirmar]` |

**Ningún color ni efecto está prohibido por asociación.** El morado, los degradados, el cristal, el neón y el modo oscuro son válidos si se eligen por el producto. Se prohíbe el valor por defecto no decidido.

### 2.2 Señales de diseño hecho por IA

Cada señal detectada se **reescribe**, no se suaviza.

**Visual**
- Brillo morado o azul por defecto; sombras de color sin desplazamiento; negro puro `#000` sin intención; saturación al máximo.
- Cristal y desenfoque en todo, o cristal sobre cristal.
- Degradado en el texto de los titulares.
- Glow en cada texto, borde y tarjeta ("todo brilla, nada destaca").
- Un solo tono dominante sin base neutra (todo verde, todo azul): falta "papel" para que el acento funcione.
- Sombras duras desplazadas (`4px 4px 0`) fuera de un estilo neobrutalista elegido.
- Mesh gradient genérico como único recurso de fondo.
- Ilustraciones 3D genéricas de "personas con portátil" o fotos de stock con sonrisa corporativa.

**Tipografía**
- Una familia sin jerarquía real; tamaños vecinos indistinguibles en el mismo bloque (14 junto a 15 con el mismo peso y color).
- Mezcla sin sistema: mayúsculas, minúsculas, itálicas y monoespaciada en la misma vista sin una regla.
- El mismo tracking en todos los tamaños; titulares grandes sin tracking negativo.
- Líneas de más de 80 caracteres; viudas en los titulares.
- Monoespaciada para texto que no es código, dato ni terminal.

**Layout**
- Hero centrado con subtítulo, dos botones y una captura con sombra.
- Tres o cuatro tarjetas idénticas de ícono, título y texto como estructura de la página.
- Tarjetas dentro de tarjetas.
- Numeración 01 / 02 / 03 sin una secuencia real.
- El mismo espaciado en todo, sin ritmo entre apretado y amplio.
- Todo metido en contenedores; nada respira.
- Eyebrow o kicker sobre cada título sin información real.

**Interacción**
- Sin `:active` y sin `:focus-visible` propio; sin estados vacío, de error o de carga.
- `transition: all 300ms`, `ease-in` en las entradas, `scale(0)` como punto de partida.
- La misma animación de entrada en todas las secciones.
- Hover que se dispara en táctil (sin `@media (hover: hover)`).
- Modales para tareas que no necesitan interrumpir.

**Copy**
- Palabras de relleno: elevar, potenciar, sin fisuras, desbloquear, revolucionar, de próxima generación, todo en uno, "impulsado por IA" como adjetivo vacío.
- Botones "Enviar", "Aceptar", "Haz clic aquí".
- Errores tipo "Algo salió mal" sin causa ni forma de recuperarse.
- Nombres de relleno: "Jane Doe", "Acme Corp", "Lorem ipsum" en una entrega.

---

## 3. Proceso de trabajo

### 3.1 Flujo completo

| Paso | Qué se hace | Salida |
|---|---|---|
| 1. Leer | Brief completo, referencias, archivos existentes, `PRODUCT.md` y `DESIGN.md` si existen. Detectar stack leyendo `package.json`, `composer.json`, `pubspec.yaml` y lockfiles | Lista de lo pedido y de lo no pedido |
| 2. Preguntar | Solo si el costo de equivocarse es alto. Máximo cinco preguntas (ver 3.2) | Respuestas o supuestos escritos |
| 3. Clasificar | Modo de superficie por pantalla y diales | Tabla pantalla → modo |
| 4. Dirección visual | Mundo visual, referencias, una idea central (metáfora) | Párrafo de dirección en `DESIGN.md` |
| 5. Sistema | Tokens, materiales, componentes base y sus estados, en un tablero propio | `tokens.css` o `@theme`, tablero de sistema |
| 6. Construir | Pantallas a partir del sistema; los cambios transversales van al sistema | Pantallas |
| 7. Estados | Vacío, carga, error con recuperación, éxito, sin permisos, offline, contenido extremo | Estados visibles y navegables |
| 8. Verificar | Capturas reales, consola, overflow, movimiento reducido, medidas críticas (sección 13) | Evidencia antes / después |
| 9. Informar | Qué cambió, qué se verificó y qué no se pudo hacer | Informe breve y honesto |
| 10. Persistir | Anotar preferencias nuevas del cliente | `DESIGN.md` actualizado |

### 3.2 Brief en cinco preguntas

1. ¿Qué es y para quién? (producto, audiencia, contexto de uso: escritorio en oficina, móvil en la calle, proyector en una sustentación).
2. ¿Qué debe lograr cada superficie? (modo de la sección 1.3).
3. ¿Qué existe ya? (marca, logo, paleta, tipografía, pantallas aprobadas, referencias).
4. ¿Qué está prohibido o reservado? (colores con significado, elementos que no se dibujan, reglas de negocio).
5. ¿Cómo se entrega y dónde vive? (código en un repo, HTML autocontenido, Figma, Canva; navegadores y anchos objetivo).

Si la persona no está disponible, se toma la lectura más razonable y se escribe al inicio del informe qué supuesto se tomó.

### 3.3 Memoria de proyecto

Dos archivos en la raíz del proyecto, leídos al inicio de cada sesión y actualizados cuando cambia una decisión:

**`PRODUCT.md`**
```markdown
# Producto
- Nombre y propósito en una frase:
- Audiencias y su contexto de uso:
- Modo por superficie: (pantalla → persuadir / experiencia / operar / leer)
- Reglas de negocio que afectan la UI: (quién aprueba qué, qué no se muestra)
- Datos de demostración (simulados, coherentes entre pantallas):
```

**`DESIGN.md`**
```markdown
# Diseño
- Dirección visual (un párrafo) y la idea central:
- Tokens: ruta del archivo fuente de verdad
- Colores reservados y su significado:
- Preferencias del cliente registradas (con ronda):
  - R12: nunca fondos de cuadrícula
  - R14: las baldosas del cierre se quedan
- Excepciones aprobadas a este playbook (con razón):
- Elementos aprobados que no se tocan:
```

### 3.4 Protocolo de variantes

Cuando la dirección no está clara, se prototipan **dos o tres direcciones reales** (no tres tonos de lo mismo), cada una con nombre, una frase de intención y la misma pantalla representativa. Se muestran con un selector o lado a lado. Se elige una y las demás se descartan sin mezclarlas, salvo que el cliente pida combinar algo concreto.

### 3.5 Pulir antes de rediseñar

Cuando el cliente dice "se ve genérico", la primera propuesta DEBERÍA ser un **pase de pulido dentro de la identidad existente** (reducir efectos, sistematizar tipografía, introducir base neutra, unificar espaciado), y la alternativa de rediseño completo se ofrece como opción, no se impone. En Operación Cassandra un rediseño industrial completo, técnicamente mejor, se descartó y se conservó la identidad original con pulido encima (sección 14.4).

### 3.6 Disciplina de alcance

- "Solo cambia X" significa que se cambia X y nada más. Tocar algo aprobado es el error más caro.
- "Idéntico" significa idéntico; "inspirado en" significa dirección, no copia.
- Una regla del cliente se aplica con el alcance con que la dijo: "nunca cuadrícula" aplicaba a fondos, no a una pieza aprobada (sección 15).
- Antes de editar, se lee la versión publicada más reciente; otros procesos pueden haber publicado entre medias. Se publican solo los archivos que cambiaron.
- Evidencia por ronda: `ronda-NN/antes`, `ronda-NN/despues`, `ronda-NN/comparar`.

### 3.7 Formato de respuesta del agente

Para tareas complejas, la respuesta va en un único flujo:

1. **Plan Estratégico**: arquitectura y lógica de alto nivel, decisiones y su razón.
2. **Instrucciones de Implementación**: pasos técnicos y código.

Marcas de delegación de modelo dentro del flujo:
- `[SWITCH_SONNET]` para generación mecánica o código extenso.
- `[SWITCH_HAIKU]` para lectura de archivos, logs o consultas simples.

Estilo: sin preámbulos ni despedidas, sin narrar el proceso, lenguaje profesional llano, sin expresiones idiomáticas.

---

## 4. Sistema de diseño

### 4.1 Arquitectura de tokens

Tres capas. Los componentes DEBEN consumir solo tokens semánticos o de componente, nunca primitivos ni hex sueltos.

```
primitivo        →  semántico                →  componente
--green-700         --color-action              --btn-primary-bg
--ink-900           --color-text                --card-title-color
--space-4           --space-inline-md           --btn-padding-x
--radius-24         --radius-card               --card-radius
```

- Fuente de verdad: un archivo (`tokens.css`, `@theme` de Tailwind v4 o JSON en formato DTCG si hay pipeline a varias plataformas).
- Nombres por rol, no por apariencia: `--color-danger`, no `--red`.
- Cada token nuevo se justifica; si un valor aparece una sola vez, probablemente no es token, es un error.

### 4.2 Color

**Método**

1. Partir de la marca (logo, manual, sector). Si no hay marca, partir de la metáfora del producto.
2. Generar rampas en **OKLCH** (luminosidad perceptualmente uniforme): 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950. Ajustar croma en los extremos para evitar tonos sucios o fuera de gama.
3. Neutros **tintados** con el matiz de la marca (croma muy bajo), no grises puros.
4. Asignar **roles semánticos** y usar siempre el rol.
5. Validar contraste de cada par real (texto/fondo, borde/fondo, foco/fondo) en las superficies donde aparece.

**Roles mínimos**

| Rol | Uso |
|---|---|
| `text`, `text-secondary`, `text-on-dark`, `text-on-accent` | Texto |
| `surface-ground`, `surface-card`, `surface-raised`, `surface-dark` | Superficies |
| `action`, `action-hover`, `action-pressed` | Primario |
| `accent` | Un solo acento con función (próxima acción, foco, estado en curso) |
| `reserved-*` | Colores con significado de negocio (credencial, IA, premium) |
| `success`, `warning`, `danger`, `info` + sus fondos tenues | Estado |
| `border-subtle`, `border-control`, `focus-ring` | Contornos |

**Reglas de dosificación**
- Mucho neutro y color de marca en superficies grandes; el acento en pocos puntos; los colores reservados solo donde corresponden.
- Texto principal casi negro tintado, nunca `#000` por defecto.
- Sombras tintadas con el color más oscuro de la marca (`rgb(0 40 28 / α)` en una marca verde), nunca negro puro.
- Sobre fondo oscuro, las partes de color del logo pueden pasar a blanco para no vibrar.
- El color nunca es el único código: estado = color + icono o texto.

**Modo oscuro (si el producto lo necesita)**
- No es invertir. Superficies elevadas son más claras, no más oscuras. Base oscura tintada (no `#000`), texto al 87–92 % de blanco, saturación de acentos reducida un paso.
- Sombras casi invisibles en oscuro: la elevación se expresa con luminosidad de superficie y hairlines de luz.
- Se valida el contraste de nuevo; los pares claros no se heredan.

**Umbrales de contraste (WCAG 2.2 AA)**

| Elemento | Mínimo |
|---|---|
| Texto normal | 4.5:1 |
| Texto grande (≥ 24 px, o ≥ 18,66 px en negrita) | 3:1 |
| Componentes de UI y contornos que identifican un control (1.4.11) | 3:1 contra lo adyacente |
| Indicador de foco | 3:1 contra lo adyacente (ver 6.1) |
| Texto deshabilitado o decorativo | Exento, pero DEBERÍA seguir siendo legible |

APCA se usa como control complementario (cuerpo de texto alrededor de Lc 75; textos grandes y finos alrededor de Lc 60), nunca en lugar de WCAG cuando el entregable se evalúa con WCAG.

### 4.3 Tipografía

- Elegir familia por la **voz del producto**, no por costumbre. Inter, Roboto o system-ui no están prohibidas; está prohibido usarlas sin decidir.
- Una familia variable bien escalada es suficiente para la mayoría de productos de operación. Dos familias (display + texto, o texto + mono para datos) cuando el modo lo pide. Tres es el máximo y requiere justificación.
- Cada familia adicional tiene un **rol único** (por ejemplo, la serif itálica solo para la voz de un personaje). Sin rol, sobra.
- Escala con pasos distinguibles. Dos tamaños que conviven en el mismo bloque o componente DEBEN diferir al menos ≈ 1,125 en tamaño, o diferenciarse claramente por peso o color. Los pasos finos (13, 14, 15, 16) son válidos porque cada uno tiene un uso distinto y no se usan juntos en el mismo bloque. Ejemplo probado en operación:

| Token | Tamaño / interlineado (px) | Uso |
|---|---|---|
| 2xs | 11 / 16 | fechas en ejes de gráficas |
| xs | 12 / 16 | chips, metadatos |
| sm | 13 / 18 | notas, leyendas |
| body-sm | 14 / 20 | tablas y listas (el más usado en operación) |
| md | 15 / 20 | botones, navegación |
| body | 16 / 24 | lectura |
| lg | 18 / 26 | |
| xl | 20 / 28 | |
| 2xl | 22 / 28 | títulos de tarjeta |
| 3xl | 28 / 36 | títulos de pantalla |
| 4xl | 34 / 40 | cabeceras de entidad |
| 5xl | 40 / 48 | títulos públicos |
| display | `clamp(40px, 5vw, 74px)` / 1.04 | titular de landing |

- Tracking por tamaño: 0 en cuerpo, −0,01 a −0,02 em en títulos, −0,03 a −0,035 em en display. Mayúsculas sostenidas solo en etiquetas muy cortas y con tracking positivo (+0,04 a +0,08 em).
- `font-variant-numeric: tabular-nums` en toda cifra comparable (KPIs, tablas, horas, contadores, precios).
- `text-wrap: balance` en titulares; `text-wrap: pretty` en párrafos. Medida de lectura entre 45 y 75 caracteres.
- Carga: WOFF2, subconjunto latino con tildes y ñ, `font-display: swap`, `size-adjust`/`ascent-override` en la fuente de respaldo para evitar CLS, `preload` solo de los pesos visibles arriba del pliegue.
- **Autocontener las fuentes** cuando el entregable puede ejecutarse sin internet (sustentaciones, laboratorios, demos locales). Una dependencia de Google Fonts rompe la tipografía si no hay red.

### 4.4 Espaciado y layout

- Base de 4 px. Escala recomendada: 2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128. Pasos intermedios (10, 14, 18, 22, 28) solo si un componente los necesita y quedan como token.
- Ritmo: apretado dentro de un grupo, amplio entre grupos. Si todo tiene el mismo espacio, no hay grupos.
- Margen lateral de página `clamp(16px, 2.6vw, 40px)`; contenido hasta 1440 px en aplicaciones, 1200–1280 en lectura.
- Grid de 12 columnas en escritorio, 8 en tablet, 4 en móvil; container queries para componentes que viven en contenedores de ancho variable.
- Alturas de columnas vecinas que se leen como pareja DEBEN igualarse.
- Ningún hueco vacío grande: si una vista deja espacio, se llena con información útil, no con decoración (ver caso Escala, ronda 22).
- Elementos geométricamente ligados (un pin y su palo, un tooltip y su ancla, un indicador y su pestaña) se calculan juntos a partir de la misma referencia, nunca con posiciones sueltas.

### 4.5 Radios

Escala por tamaño de elemento:

| Token | px | Uso |
|---|---|---|
| xs / sm | 6 / 8 | chips, etiquetas |
| block | 12 | bloques de agenda, celdas |
| input | 12–14 | campos |
| md / lg | 16 / 20 | tarjetas pequeñas, popovers |
| xl | 24 | tarjetas |
| 2xl / 3xl | 28 / 32 | paneles |
| panel | 36 (26 en móvil) | panel claro dentro de un marco |
| hero | 40 | escenas protagonistas |
| pill | 999 | solo controles |

Radios anidados concéntricos: `radio interno = radio externo − padding`. Un `corner-shape: squircle` PUEDE usarse con fallback donde el navegador lo soporte.

### 4.6 Sombras y elevación

Patrón: una sombra de contacto corta + una sombra ambiental larga con **spread negativo**, tintadas.

```css
--shadow-hairline: 0 1px 2px rgb(0 40 28 / .05);
--shadow-card:     0 1px 2px rgb(0 40 28 / .06), 0 2px 8px -2px rgb(0 40 28 / .06);
--shadow-raised:   0 1px 2px rgb(0 40 28 / .06), 0 12px 28px -22px rgb(0 40 28 / .35);
--shadow-float:    inset 0 1px 0 #FFF, 0 2px 4px -1px rgb(0 40 28 / .12), 0 18px 40px -18px rgb(0 40 28 / .45);
--shadow-modal:    0 24px 64px -16px rgb(0 40 28 / .45), 0 4px 12px -4px rgb(0 40 28 / .12);
```

- Contornos de tarjeta como `box-shadow: inset 0 0 0 1px …` para no alterar el tamaño de la caja.
- **Contornos de controles** (inputs, checkboxes, botones secundarios) DEBEN alcanzar 3:1 contra el fondo si el contorno es lo que identifica el control. Un hairline decorativo de tarjeta no necesita 3:1; el borde de un input sí.
- Escala de `z-index` como tokens (`--z-base 0`, `--z-sticky 10`, `--z-dropdown 20`, `--z-overlay 30`, `--z-modal 40`, `--z-toast 50`, `--z-tooltip 60`). Nunca `z-index: 9999`.

### 4.7 Breakpoints y anchos de verificación

| Ancho | Representa |
|---|---|
| 390 | Móvil actual (verificar también 360 si la audiencia usa Android de gama media) |
| 768 | Tablet vertical |
| 1280 | Portátil común |
| 1366 | Portátil de oficina y aulas (añadir cuando la audiencia lo usa) |
| 1440 | Escritorio |

Diseño mobile-first en CSS (`min-width`), aunque el diseño visual empiece en escritorio. Las alturas de viewport usan `100dvh`/`100svh`, no `100vh`.

---

## 5. Materiales: Liquid Glass y profundidad

### 5.1 Reglas del cristal

- El cristal es una **capa funcional** para navegación y controles flotantes, y para tarjetas protagonistas sobre una escena. No es el material del contenido.
- DEBE ir sobre un fondo visible (escena, marco o color). Sobre blanco liso no se ve y sobra.
- El texto va sobre la capa de color del cristal, nunca sobre el desenfoque solo.
- Nunca cristal sobre cristal.
- Tres variantes como máximo, cada una con su función:

| Clase | Función | Relleno | Desenfoque |
|---|---|---|---|
| `.glass-nav` | Navegación sobre color | blanco 62 → 46 % | 14 px, saturación 170 % |
| `.glass-float` | Controles y paneles flotantes (popovers, barras de acción, indicadores) | blanco 94 → 88 % | 20 px, saturación 180 % |
| `.glass-hero` | Tarjeta protagonista sobre escena | blanco 72 → 56 % | 28 px, saturación 170 % |
| `.on-dark` | Modificador sobre fondo oscuro | blanco 16 → 7 % | igual a la variante |

### 5.2 Borde de luz

El aro de 1 px vive en una capa propia enmascarada para no teñir el relleno translúcido. El degradado simula luz que entra por arriba a la izquierda.

```css
.glass-hero::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1px;pointer-events:none;z-index:-1;
  background:var(--rim,linear-gradient(160deg,rgb(255 255 255/.95),rgb(255 255 255/.25) 45%,rgb(255 255 255/.6)));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;
  mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);
}
```

Cada cristal suma `position: relative`, `isolation: isolate`, `inset 0 1px 0 #FFF` (brillo del canto superior) y sombra en capas tintada. En hover (solo con puntero fino), la luz del borde se intensifica y la sombra de contacto se acorta; al presionar, `scale(.98)`.

### 5.3 Alternativas obligatorias

```css
/* Navegadores sin backdrop-filter */
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  :is(.glass-nav,.glass-float,.glass-hero){background:#FFF}
  :is(.glass-nav,.glass-float,.glass-hero).on-dark{background:#0E4A3A}
}
/* Preferencia del usuario (soporte parcial entre navegadores: no reemplaza al @supports) */
@media (prefers-reduced-transparency:reduce){
  :is(.glass-nav,.glass-float,.glass-hero){background:#FFF;-webkit-backdrop-filter:none;backdrop-filter:none}
}
/* Alto contraste del sistema */
@media (forced-colors:active){
  :is(.glass-nav,.glass-float,.glass-hero){border:1px solid CanvasText}
}
```

No existe un selector comodín de clases: `.glass-*` es inválido y descarta la regla completa. Se usa `:is(...)` con la lista de clases o `[class*="glass-"]`.

### 5.4 Rendimiento del cristal

- `backdrop-filter` recalcula en cada frame lo que hay detrás. Limitar a pocas capas visibles a la vez, nunca en elementos de listas largas que hacen scroll.
- Desenfoque máximo razonable 28–32 px. Más no se ve mejor y cuesta más.
- En móvil de gama media, reducir a la variante sin desenfoque si el scroll pierde fluidez.

### 5.5 Profundidad sin imágenes

- Escenas, ilustraciones, logos e íconos en SVG o CSS cuando sea posible: escalan, pesan poco y se pueden animar.
- Íconos con volumen construidos por capas (base, cara, brillo) solo a partir de 40 px. Debajo de ese tamaño, glifo plano con `currentColor`.
- Fotografía real solo si el producto la exige (catálogo, inmuebles, personas reales con permiso). Nunca stock genérico.

---

## 6. Componentes y estados

### 6.1 Foco visible

El foco DEBE verse sobre cualquier superficie del producto. Un anillo de un solo color de acento suele fallar en alguna superficie. Solución probada: **anillo doble** (color de acento por fuera + color oscuro de la marca por dentro), que garantiza 3:1 contra fondos claros y oscuros.

```css
:where(button,a,input,select,textarea,[tabindex]):focus-visible{
  outline:2px solid var(--focus-outer);   /* acento, por ejemplo #E9A427 */
  outline-offset:2px;
  box-shadow:0 0 0 2px var(--focus-inner), var(--elev, 0 0 #0000); /* oscuro de la marca + sombra propia */
}
```

Cada componente declara su sombra o contorno en `--elev` (por ejemplo `.card{--elev:var(--shadow-card);box-shadow:var(--elev)}`). Así el anillo de foco se suma a la sombra del componente en lugar de reemplazarla o perderse según el orden de la hoja de estilos.

Nunca `outline: none` sin sustituto. El foco no puede quedar tapado por cabeceras fijas (WCAG 2.4.11): usar `scroll-margin-top` igual a la altura de la cabecera.

### 6.2 Botones

Estados DEBEN estar diseñados todos: reposo, hover, foco, presión, carga, deshabilitado y confirmación.

```css
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;position:relative;
  height:44px;padding:0 20px;border-radius:999px;font:600 15px/20px var(--font-ui);
  transition:background-color 180ms ease,color 180ms ease,box-shadow 180ms ease,transform 140ms var(--ease-out)}
@media (hover:hover) and (pointer:fine){ .btn-primary:hover{background:var(--color-action-hover)} }
.btn:active:not([aria-disabled=true]){transform:scale(.97)}
.btn[aria-disabled=true],.btn:disabled{opacity:.48;cursor:not-allowed}
.btn-sm{height:36px} .btn-lg{height:52px}

/* Carga sin cambio de ancho */
.btn[aria-busy=true]{color:transparent;cursor:progress}
.btn[aria-busy=true]>*{visibility:hidden}
.btn[aria-busy=true]::after{content:"";position:absolute;inset:0;margin:auto;width:18px;height:18px;border-radius:50%;
  border:2px solid rgb(255 255 255/.35);border-top-color:#FFF;animation:spin 700ms linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Confirmación: misma caja, cambia el contenido */
.btn.is-done{background:var(--color-success-bg);color:var(--color-success-ink)}
```

- Patrón de guardado: reposo → cargando (mismo ancho) → "Hecho" con check → vuelve. Nunca hay salto de layout.
- Durante la carga, `aria-busy="true"` **y** `aria-disabled="true"` para impedir el doble envío; se ignora el clic en JS. Se prefiere `aria-disabled` a `disabled` porque `disabled` saca el botón del orden de foco y el lector pierde el contexto.
- Botón de solo icono: 44 × 44 px y `aria-label` obligatorio.
- Etiquetas con verbo y objeto: "Registrar asistencia", "Guardar cambios", "Analizar nota". Nunca "Enviar" o "Aceptar" a secas.

### 6.3 Campos y formularios

- Etiqueta visible siempre (el placeholder no es etiqueta). Texto de ayuda debajo, ligado con `aria-describedby`.
- Validación al salir del campo (`blur`) y al enviar; nunca en cada pulsación mientras la persona escribe por primera vez. Tras el primer error, revalidar en vivo para que vea cuándo se corrige.
- Mensaje de error con causa y solución: "La fecha debe ser posterior al 4 nov. 2026", no "Fecha inválida". Asociado con `aria-describedby` y `aria-invalid="true"`.
- Al enviar con errores, foco al primer campo inválido y un resumen arriba si el formulario es largo.
- **Conservar lo que escribió la persona** en cualquier error, incluido el error de red.
- Contraseña: botón "Mostrar"; permitir pegar (WCAG 3.3.8: no bloquear gestores de contraseñas ni exigir pruebas cognitivas).
- No pedir dos veces el mismo dato en un flujo (WCAG 3.3.7); autocompletar con `autocomplete` correcto.
- Tipos de input correctos (`email`, `tel`, `inputmode="numeric"`) para el teclado móvil.
- Formatos tolerantes: aceptar "3001234567" y "300 123 4567"; normalizar en el sistema (ley de Tesler).

### 6.4 Selector segmentado

Primero se decide la semántica, luego el estilo:

| Si el selector… | Semántica |
|---|---|
| Cambia el panel visible (Mes / Semana / Día) | `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, foco itinerante (`tabindex` 0 solo en la activa) y flechas |
| Filtra una lista sin cambiar de vista | Grupo de botones con `aria-pressed`, o `radiogroup` si es exclusivo |

**Efecto líquido:** el indicador anima sus dos bordes por separado con duraciones distintas; el borde que avanza llega antes (240 ms) que el que sigue (440 ms), y la superficie se estira y se recoge.

```css
.seg{position:relative;display:inline-flex;padding:4px;border-radius:999px;background:rgb(30 33 32/.06);contain:layout paint}
.seg-ind{position:absolute;top:4px;bottom:4px;left:var(--l);right:var(--r);border-radius:999px;
  transition:left var(--dl,380ms) var(--ease-move),right var(--dr,380ms) var(--ease-move)}
```

```js
function place(i){
  const t = tabs[i], tr = seg.getBoundingClientRect(), r = t.getBoundingClientRect();
  const goingRight = i > current;
  seg.style.setProperty('--dr', goingRight ? '240ms' : '440ms'); // borde que avanza
  seg.style.setProperty('--dl', goingRight ? '440ms' : '240ms'); // borde que sigue
  seg.style.setProperty('--l', (r.left - tr.left) + 'px');
  seg.style.setProperty('--r', (tr.right - r.right) + 'px');
  tabs.forEach((x, k) => { x.setAttribute('aria-selected', k === i); x.tabIndex = k === i ? 0 : -1; });
  current = i;
}
```

Este es el único caso aprobado de animar `left`/`right` (propiedades de layout). Se acepta porque el elemento es pequeño, absoluto y su contenedor tiene `contain: layout paint`, de modo que el recálculo no sale de la pista. La alternativa sin layout es animar `clip-path: inset()` sobre una capa duplicada de etiquetas.

La selección no es progreso: un selector cambia la vista; nunca se usa para indicar avance.

### 6.5 Acordeón

Altura real animada sin JavaScript con una fila de grid, y contenido inerte mientras está cerrado (si no, los enlaces ocultos reciben foco):

```css
.acc-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows 320ms var(--ease-move)}
.acc-body>div{overflow:hidden;min-height:0}
.acc[aria-expanded=true]+.acc-body{grid-template-rows:1fr}
.acc[aria-expanded=true] .acc-ico{transform:rotate(45deg)}
```

```js
acc.addEventListener('click', () => {
  const open = acc.getAttribute('aria-expanded') === 'true';
  acc.setAttribute('aria-expanded', String(!open));
  panel.firstElementChild.inert = open; // cerrado = inerte
});
// Estado inicial: sin esto, el panel cerrado es enfocable hasta el primer clic
panel.firstElementChild.inert = acc.getAttribute('aria-expanded') !== 'true';
```

O directamente en el HTML inicial: `<div class="acc-body"><div inert>…</div></div>`.

### 6.6 Popover, menú y tooltip

- Nacen de su origen: `transform-origin` en el disparador (con Radix: `var(--radix-popover-content-transform-origin)`; con Base UI: `var(--transform-origin)`). Los modales son la excepción: centro.
- Entrada desde `scale(.94–.97)` + `opacity: 0` + 4 px de desplazamiento, 150–200 ms (hasta 240 ms en dropdowns y selects). Nunca `scale(0)`.
- Escape cierra y **devuelve el foco** al disparador. Clic fuera cierra los no modales.
- Tooltip: aparece con hover **y** con foco de teclado; se puede cerrar con Escape sin mover el puntero; el puntero puede pasar sobre él sin que desaparezca (WCAG 1.4.13). Retraso inicial ~300 ms; los siguientes tooltips del mismo grupo aparecen sin retraso ni animación.
- El contenido esencial nunca vive solo en un tooltip (no existe en táctil).

### 6.7 Modal, drawer y panel lateral

- Modal solo si la tarea DEBE interrumpir (confirmar algo destructivo, completar un paso bloqueante). Si no, panel lateral o edición en línea.
- `<dialog>` nativo con `showModal()` o una librería headless (Radix, Base UI, React Aria). Trampa de foco, `aria-labelledby`, Escape, scroll del fondo bloqueado.
- Al cerrar, el foco vuelve al elemento que lo abrió.
- Drawer móvil con gesto de arrastre: umbral por velocidad, no solo por distancia; amortiguación en los límites; alternativa con botón (WCAG 2.5.7: todo arrastre tiene alternativa de un solo puntero).

### 6.8 Toasts y avisos

- Para confirmaciones no críticas. Lo crítico se muestra en línea o en un diálogo.
- Entran y salen por el mismo lado; se pueden descartar; se pausan con hover y foco; `role="status"` (informativo) o `role="alert"` (urgente).
- Duración mínima proporcional al texto (≈ 4 s + 1 s cada 20 palabras). Si tiene acción ("Deshacer"), no desaparece mientras tiene foco.

### 6.9 Tablas y listas de operación

- Cifras alineadas a la derecha con `tabular-nums`; texto a la izquierda; cabeceras fijas en scroll largo.
- Fila con hover y foco visibles; acciones de fila al final y accesibles por teclado.
- Densidad ajustable si la audiencia la pide (cómoda / compacta).
- En móvil, la tabla pasa a tarjetas o lista con los dos o tres campos clave; nunca un scroll horizontal sin indicación.
- Listas de más de ~200 filas: virtualizar o paginar.

### 6.10 Estados de vista obligatorios

| Estado | Qué DEBE mostrar |
|---|---|
| Carga | Skeleton con la forma real del contenido si la espera supera ~300 ms; spinner solo en acciones puntuales. Nada parpadea si la carga dura menos de 300 ms |
| Vacío | Qué es esta vista, por qué está vacía y la acción para llenarla. Distinguir "sin datos todavía" de "sin resultados para este filtro" |
| Error | Causa en lenguaje humano, qué puede hacer la persona, botón de reintentar, y lo que escribió conservado |
| Éxito | Confirmación proporcional: cambio de estado en el botón, toast o pantalla de cierre en flujos largos |
| Sin permisos / rol | Qué no puede hacer y a quién pedir acceso; las acciones no permitidas se ocultan o se marcan como solo lectura de forma consistente |
| Offline | Aviso persistente discreto y qué funciona sin conexión |
| Contenido extremo | Nombres de 80 caracteres, campos vacíos, un solo carácter, cifras de 9 dígitos, 0 y 1 elementos, 500 elementos |
| Deshabilitado | Por qué está deshabilitado (texto cercano o tooltip accesible) |

---

## 7. Movimiento

### 7.1 Marco de decisión

**¿Debe animarse?** Por frecuencia de uso:

| Frecuencia | Decisión |
|---|---|
| Cientos de veces al día (atajos de teclado, paleta de comandos) | Sin animación |
| Decenas de veces al día (hover, navegación de listas) | Mínima o ninguna |
| Ocasional (modales, drawers, toasts) | Animación estándar |
| Rara o primera vez (onboarding, landing, celebración) | Puede deleitar |

Las acciones iniciadas con teclado no se animan.

**¿Para qué?** Propósitos válidos: consistencia espacial (de dónde viene y a dónde va), indicación de estado, explicación (marketing), respuesta al gesto y evitar cambios bruscos. "Se ve bonito" solo vale en superficies de uso raro.

### 7.2 Easing

| Situación | Curva |
|---|---|
| Entrada o salida de un elemento | ease-out fuerte: `cubic-bezier(0.23, 1, 0.32, 1)` |
| Desplazamiento o transformación en pantalla, drawers, selector líquido, acordeón | `cubic-bezier(0.32, 0.72, 0, 1)` |
| Movimiento en pantalla simétrico | `cubic-bezier(0.77, 0, 0.175, 1)` |
| Cambio de color en hover | `ease` |
| Movimiento constante (progreso, marquesina) | `linear` |
| Apariciones por scroll | `cubic-bezier(0.22, 1, 0.36, 1)` |

Nunca `ease-in` en interfaz: retrasa el movimiento justo cuando la persona mira.

### 7.3 Duración

| Elemento | Duración |
|---|---|
| Respuesta al presionar | 100–160 ms |
| Tooltip, popover pequeño | 125–200 ms (popover 150–200 ms) |
| Dropdown, select | 150–250 ms |
| Hover de color y sombra | 140–200 ms |
| Acordeón, expansión de contenido | 280–380 ms |
| Modal, drawer | 200–500 ms |
| Indicador líquido | 240 ms (avance) / 440 ms (seguimiento) |
| Marketing, explicación, escena | Puede ser mayor |

**Regla:** las respuestas de interfaz quedan por debajo de 300 ms. Las excepciones permitidas son desplazamientos de superficie grande (acordeón, drawer, modal) y efectos de material (indicador líquido), porque el ojo sigue un recorrido, no espera una respuesta. Las salidas son más rápidas que las entradas.

### 7.4 Propiedades

- Movimiento y entrada/salida: **solo `transform` y `opacity`** (se componen en GPU).
- Cambios de estado en hover: `background-color`, `color`, `box-shadow` y `border-color` están permitidos en elementos pequeños, siempre listados de forma explícita.
- Excepciones documentadas: `grid-template-rows` en acordeón, `left`/`right` del indicador líquido con contenedor contenido, `clip-path` para revelados y `filter: blur()` de 2–4 px solo durante un fundido cruzado.
- Nunca `transition: all`. Nunca animar `width`, `height`, `top` o `margin` en elementos grandes o en listas.

### 7.5 Reglas de ejecución

1. Todo es interrumpible: para interacciones que pueden repetirse rápido se usan transiciones CSS, no keyframes (los keyframes reinician desde cero).
2. Lo que se abre nace de su origen.
3. Respuesta al presionar: `scale(.97)` (rango 0,95–0,98) en 100–160 ms.
4. Cada sección con su propia entrada; no la misma en toda la página.
5. Escalonado de 30–80 ms entre elementos; nunca bloquea la interacción.
6. Hover solo con puntero fino: `@media (hover: hover) and (pointer: fine)`.
7. Entradas de elementos que aparecen en el DOM con `@starting-style` cuando el navegador lo soporta.
8. Si un fundido entre dos estados se ve como dos objetos superpuestos, un `filter: blur(2px)` breve durante la transición lo une.
9. Springs solo cuando el gesto trae inercia (arrastrar, lanzar). En UI general, amortiguamiento crítico (sin rebote).
10. Con Motion (Framer Motion) bajo carga, animar `transform: "translateX()"` en lugar de las props `x`/`y`.
11. Animaciones continuas se pausan cuando la pestaña no está visible (`visibilitychange`) o el elemento sale de pantalla (`IntersectionObserver`).
12. Apariciones por scroll con `IntersectionObserver` o scroll-driven animations de CSS; nunca listeners de `scroll` sin `passive` y sin throttling.

### 7.6 Movimiento reducido

`prefers-reduced-motion: reduce` tiene una **alternativa diseñada**, no solo "apagar":

- Recorridos guiados por scroll pasan a un modo secuencial con cortes.
- Desplazamientos se convierten en fundidos cortos.
- Efectos que siguen al cursor (mirada de un personaje, gotas, brillos) se desactivan.
- Indicadores de carga siguen girando, más lentos (1,6 s por vuelta), porque comunican estado.

```css
@media (prefers-reduced-motion:reduce){
  .btn,.seg-ind,.acc-body,:is(.glass-nav,.glass-float,.glass-hero),.tip{transition-duration:1ms!important}
  .pop{animation:none!important}
  .btn[aria-busy=true]::after{animation-duration:1.6s}
}
```

### 7.7 Tokens de movimiento

```css
--ease-out:      cubic-bezier(0.23, 1, 0.32, 1);  /* entradas, salidas, respuesta al presionar */
--ease-move:     cubic-bezier(0.32, 0.72, 0, 1);
--ease-in-out:   cubic-bezier(0.77, 0, 0.175, 1);
--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
--dur-press: 120ms; --dur-fast: 140ms; --dur-base: 180ms; --dur-mid: 240ms; --dur-slow: 320ms;
--dur-liquid-lead: 240ms; --dur-liquid-trail: 440ms;
--press-scale: .97;
```

### 7.8 Ficha técnica de cada animación firma

Toda animación que no sea una transición estándar se documenta con: disparador, propiedades animadas, duración, easing (token), keyframes o estado inicial/final, librería (o CSS puro), alternativa de movimiento reducido, cómo se interrumpe y prioridad (alta / media / baja). Así otro agente puede reproducirla o retirarla sin adivinar.

---

## 8. Visualización de datos

- Elegir el gráfico por la pregunta: comparación entre categorías → barras; evolución → líneas; parte de un todo con pocas partes → barra apilada al 100 % (tortas solo con 2–3 partes); distribución → histograma; relación → dispersión; flujo entre etapas → embudo o barras por etapa; intensidad por día y hora → mapa de calor.
- Barras desde cero. Sin 3D. Sin doble eje salvo necesidad clara y rotulada.
- Etiquetas directas sobre la serie antes que leyendas lejanas.
- El color nunca es el único código: forma, patrón, posición o texto lo acompañan.
- Paleta categórica de 5–7 tonos validados para daltonismo; secuencial de un matiz para magnitudes; divergente con punto medio neutro.
- KPI: valor con `tabular-nums`, unidad, periodo, comparación ("+4 frente a la semana pasada") y estado. Un número sin contexto no es un KPI.
- Gráficas con `role="img"` y `aria-label` que resume el hallazgo, más una tabla accesible o el dato en texto.
- Las cifras de una demo son coherentes entre pantallas y en el tiempo (si una tarjeta dice 7 de 11 compromisos, el detalle tiene 11 y 7 cumplidos).

---

## 9. Copy y escritura de interfaz

### 9.1 Reglas

- Idioma por defecto: español de Colombia, tuteo neutro, salvo que el brief diga otra cosa.
- Concreto y con verbo: "Registrar asistencia", "Ver detalle", "Descargar informe PDF".
- Errores = problema + causa + recuperación. "No pudimos guardar porque se perdió la conexión. Tus cambios siguen aquí. Reintentar."
- Vacíos = qué es + por qué está vacío + siguiente acción.
- Confirmaciones destructivas nombran el objeto y la consecuencia: "Eliminar el evento 'Taller de ventas'. Se cancelarán 32 inscripciones." Botón: "Eliminar evento", no "Sí".
- Mayúsculas de oración en títulos y botones. Mayúsculas sostenidas solo en etiquetas muy cortas.
- Fechas y números con `Intl` y locale `es-CO`: `Intl.DateTimeFormat('es-CO',{day:'numeric',month:'short',year:'numeric'})` produce "4 de nov de 2026"; la hora sale como "2:00 p. m." y la moneda como "$ 1.250.000". Si el diseño usa la forma compacta "4 nov. 2026", se arma con `formatToParts` y se usa igual en todo el producto. Separador de miles con punto, decimal con coma.
- Prever expansión del texto al traducir (+30 % en algunos idiomas) y plurales correctos ("1 empresa", "2 empresas", "Ninguna empresa").

### 9.2 Palabras prohibidas

Elevar, potenciar, sin fisuras, desbloquear, revolucionar, de próxima generación, todo en uno, solución integral, experiencia única, "impulsado por IA" como adjetivo, "Haz clic aquí", "Algo salió mal", "Ups".

### 9.3 Datos de demostración

- Personajes y entidades simulados con nombres plausibles del contexto local, marcados como simulados en algún lugar visible del entregable o de su documentación.
- Un conjunto único de datos de demostración por proyecto, registrado en `PRODUCT.md`, reutilizado en todas las pantallas.
- Si un dato institucional no está confirmado, se dice: "piloto propuesto", "respaldo por confirmar".

### 9.4 Interfaces con IA

- La IA **propone** y una persona **aprueba**. Nada se registra, envía o borra sin confirmación explícita por elemento.
- Mostrar qué contexto usa la IA (historial de la entidad, documento, filtros) y permitir editar su propuesta antes de aprobar.
- Estados propios: escribiendo, procesando, lista, error con reintento, sin contexto suficiente.
- Respuesta por streaming cuando tarda más de un segundo; botón para detener.
- Un personaje o asistente gana vida cuando se relaciona con la interfaz (se asoma desde el borde de una tarjeta, mira lo que el usuario hace) en lugar de flotar en una esquina.
- Nunca presentar como hecho lo que la IA infirió; distinguir visualmente "interpretación" de "dato registrado".

---

## 10. Rendimiento

| Métrica | Objetivo |
|---|---|
| LCP | ≤ 2,5 s |
| INP | ≤ 200 ms |
| CLS | ≤ 0,1 |
| Lighthouse Performance y Accessibility | ≥ 90 |

- Imágenes con `width` y `height` (o `aspect-ratio`), formatos AVIF/WebP, `srcset`, `loading="lazy"` fuera del primer pliegue y `fetchpriority="high"` en la imagen LCP.
- Fuentes autocontenidas, subconjunto, `font-display: swap` y fallback ajustado (sección 4.3).
- JavaScript del cliente solo donde hay interacción; en Next.js preferir componentes de servidor; en sitios de contenido, islas (Astro).
- Nada de librerías pesadas para efectos que CSS resuelve (acordeón, selector, popover, scroll-driven).
- 3D solo si comunica algo que el 2D no puede. Una montaña o un objeto rotable PUEDE resolverse con SVG proyectado; three.js / R3F cuando hay iluminación, materiales o cámara libre de verdad. En 3D: `dpr` limitado a 2, `frameloop="demand"`, pausa fuera de pantalla, liberar recursos al desmontar, alternativa estática.
- `backdrop-filter`, sombras grandes y filtros SVG limitados en número y fuera de listas que hacen scroll.
- Medir antes de optimizar; reportar el número, no la impresión.

---

## 11. Accesibilidad

Objetivo mínimo: **WCAG 2.2 AA**.

| Área | Requisito |
|---|---|
| Contraste | Sección 4.2. Verificado con los pares reales, no con la paleta aislada |
| Foco | Visible, propio, 3:1, no tapado por elementos fijos (2.4.7, 2.4.11, 1.4.11) |
| Teclado | Todo operable con teclado, orden lógico, sin trampas; Escape cierra y devuelve el foco |
| Objetivos | Mínimo 24 × 24 px (2.5.8); recomendado 44 × 44 px en táctil y controles principales |
| Arrastre | Toda acción de arrastre tiene alternativa con botones (2.5.7) |
| Contenido en hover/foco | Descartable, señalable y persistente (1.4.13) |
| Formularios | Etiquetas, errores asociados, sin pedir dos veces el mismo dato (3.3.7), autenticación sin prueba cognitiva y con pegado permitido (3.3.8) |
| Ayuda | Si hay ayuda, aparece en el mismo lugar en todas las pantallas (3.2.6) |
| Semántica | HTML nativo primero (`button`, `a`, `dialog`, `details`); ARIA solo para completar. `aria-pressed`, `aria-selected`, `aria-expanded`, `aria-busy` coherentes con lo visual |
| Imágenes e íconos | `alt` descriptivo en informativas; `alt=""` o `aria-hidden="true"` en decorativas |
| Zoom | Funciona al 200 % y a 320 px de ancho sin pérdida de contenido; nunca `user-scalable=no` |
| Preferencias | `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`, `forced-colors`, `prefers-color-scheme` cuando hay modo oscuro |
| Idioma | `<html lang="es">` y `lang` en fragmentos en otro idioma |

Herramientas: axe-core (con `@axe-core/playwright`), lector de pantalla real en al menos un flujo (NVDA en Windows o VoiceOver en macOS/iOS), navegación completa solo con teclado.

---

## 12. Responsive y plataformas

- Se diseña cada pantalla en los anchos de la sección 4.7. El móvil no es la versión de escritorio apretada: se repriorizan contenidos.
- Navegación: barra lateral contraíble en escritorio (recordando su estado en `localStorage` con `try/catch`), barra inferior o menú en móvil para 3–5 destinos.
- Calendarios, tablas y mapas tienen vista móvil propia (lista diaria, tarjetas, mapa a pantalla completa con hoja inferior).
- Áreas seguras en móvil: `env(safe-area-inset-*)`.
- Plataformas nativas: en iOS 26 el Liquid Glass es del sistema (no se imita con capas propias encima); en Android, Material 3 Expressive. En React Native o Flutter se respetan los patrones de la plataforma salvo que el brief pida identidad propia.
- PWA solo si aporta (uso repetido, offline real).

---

## 13. Control de calidad

### 13.1 Verificación automática

Antes de mostrar cualquier entrega:

- Capturas de página completa y de cada estado relevante en los anchos de la sección 4.7.
- **Red bloqueada** (solo `file:`, `data:`, `blob:`) cuando el entregable debe ser autocontenido: 0 peticiones externas.
- **0 errores** de página y de consola.
- Emulación de `prefers-reduced-motion` y comprobación de la alternativa.
- **0 px de overflow horizontal** en todos los anchos.
- Medidas de las alineaciones críticas (pin sobre su palo, alturas iguales, separaciones exactas, orden cronológico de los datos).
- Recorrido con guion de las interacciones: clic, teclado (Tab, flechas, Escape), escritura, hover y arrastre.

Script base probado (Node 18+ con Playwright):

```js
// qa-check.mjs — uso: node qa-check.mjs pagina.html --out qa-out
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const file = path.resolve(args[0]);
const out = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'qa-out';
mkdirSync(out, { recursive: true });

const WIDTHS = [390, 768, 1280, 1440];
const browser = await chromium.launch();
const report = [];

for (const reducedMotion of ['no-preference', 'reduce']) {
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion });
    const page = await ctx.newPage();
    const errors = [], external = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.route('**/*', r => {
      const u = r.request().url();
      if (/^(file|data|blob):/.test(u)) return r.continue();
      external.push(u); return r.abort();
    });
    await page.goto(pathToFileURL(file).href);
    await page.waitForTimeout(400);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: path.join(out, `${width}-${reducedMotion === 'reduce' ? 'rm' : 'std'}.png`), fullPage: true });
    report.push({ width, reducedMotion, errors: errors.length, external: external.length, overflowPx: overflow });
    await ctx.close();
  }
}
await browser.close();
console.table(report);
process.exit(report.some(r => r.errors || r.external || r.overflowPx > 0) ? 1 : 0);
```

Notas: con módulos ES, Node no usa `NODE_PATH`; si Playwright está instalado de forma global, enlazar `node_modules` en la carpeta del script o instalarlo localmente (`npm i -D playwright`). Si el proyecto usa servidor de desarrollo, sustituir `pathToFileURL` por la URL local y quitar el bloqueo de red.

Para accesibilidad automática se añade `@axe-core/playwright` y se falla la verificación con cualquier violación `serious` o `critical`.

### 13.2 Revisión con criterio

Puntuar de 1 a 5 cada dimensión, con una frase de evidencia por puntuación:

| Dimensión | Pregunta |
|---|---|
| Jerarquía | ¿Se entiende en 3 segundos qué es lo principal? |
| Tipografía | ¿Escala con pasos claros, tracking por tamaño, medida correcta? |
| Color | ¿Roles respetados, acento dosificado, contraste real? |
| Espaciado | ¿Ritmo entre apretado y amplio, alineaciones exactas? |
| Movimiento | ¿Con propósito, rápido, interrumpible, con alternativa reducida? |
| Estados | ¿Están todos y son navegables? |
| Accesibilidad | ¿Teclado, foco, ARIA, objetivos, lector? |
| Copy | ¿Concreto, en español correcto, sin relleno? |
| Rendimiento | ¿Métricas medidas dentro del objetivo? |
| Coherencia | ¿Parece un solo producto en todas las pantallas? |

Hallazgos en tabla **Antes / Después / Por qué**, ordenados por impacto. Para trabajo de alto riesgo (entregas evaluadas, cliente externo), la revisión la hace un agente independiente que no participó en la construcción, con el código y las capturas, no con la conclusión del constructor.

### 13.3 Revisión del movimiento

- Ver cada animación en cámara lenta (DevTools → Animations al 10–25 %) y cuadro a cuadro.
- Comprobar origen de transformación, sincronía entre propiedades, interrupción a mitad de camino y ausencia de saltos de layout durante la carga.
- Revisar al día siguiente con ojos frescos.

### 13.4 Informe de entrega

Tres bloques, sin adornos:

1. **Qué cambió** (por pantalla o componente).
2. **Qué se verificó** y cómo (capturas, script, medidas).
3. **Qué no se pudo verificar o hacer**, y por qué (navegador no disponible, dato pendiente, límite de una herramienta).

Nunca decir "listo" sin haberlo mirado.

---

## 14. Casos de estudio

Los casos son aprendizaje, no estándar. Ninguno se copia como estilo por defecto.

### 14.1 Escala — plataforma de acompañamiento empresarial (CDE UNAB)

**Contexto.** Mockups de alta fidelidad de una plataforma con portal del equipo del CDE (operación), portal del emprendedor (lectura), landing (persuasión) y acceso (experiencia). 16 pantallas, 7 tableros de sistema, 15 demos de animación con 57 fichas técnicas, más de 24 rondas con el cliente. Datos simulados: Café Santander S.A.S., Laura Gómez (emprendedora), Andrés Rueda (asesor), credencial ESC-2026-0042.

**Decisiones que funcionaron**
- **Sistema antes que pantallas**: tableros de fundamentos, materiales y estados, componentes, copiloto, gráficas, identidad y sistema. Por eso 16 pantallas se ven como un producto.
- **Paleta con significado**: verdes de la marca para estructura, naranja `#E9A427` solo para próxima acción, hito en curso y foco; morado `#8600DD` reservado para credenciales, diagnóstico y el copiloto de IA.
- **Un solo marco** para ambos portales (`#0B4A39` con manchas de luz de la marca) y la sección activa marcada con un detalle pequeño (piquito redondeado), no con color.
- **Metáfora de producto**: la ruta del emprendedor como una montaña con hitos; landing con cámara guiada por scroll a través de cinco estaciones.
- **Copiloto "Banu"**: gota líquida en SVG con filtro goo y SMIL, cinco estados, se asoma desde el borde de una tarjeta, propone compromisos editables que el asesor aprueba uno por uno.
- **Montaña en SVG proyectado con JavaScript** (rotación, orden de profundidad, ocultación de hitos) en lugar de three.js: menos peso, mismo efecto.
- **Selector líquido de dos bordes**, acordeón con grid, botones con carga sin cambio de ancho.
- **QA con Playwright** en cada ronda, evidencia antes/después guardada.

**Lo que se corrigió en la auditoría de esta versión** (detalle en el Anexo A): anillo de foco naranja a 2,14:1 sobre blanco, contorno de input a 1,77:1, selector CSS `.glass-*` inválido, acordeón con contenido enfocable cerrado, hover sin consulta de puntero, falta de tablet en la verificación y de modo oscuro en el sistema.

**Reglas que deja**: sección 15.

### 14.2 Noctua — plataforma de monitoreo de servicios

**Contexto.** Laravel + React/Vite/TS. Diseño en Figma con vistas por rol (admin, operador, observador): login con recuperación en tres pasos, dashboard, servicios, reglas de alerta, incidentes, canales, equipo, perfil y modales. Segundo lugar en IngenioTIC (Facultad de Ingeniería, UNAB).

**Funcionó**
- Pasar de una interfaz oscura plana y genérica a una con **atmósfera** (manchas de color animadas en el fondo, cristal, CTA cálido).
- **Vistas por rol coherentes**: el observador ve la misma interfaz con una etiqueta "Solo lectura" y sin acciones, no una interfaz distinta.
- **Perfil estilo Ajustes de Apple**: tarjeta de perfil destacada, etiquetas de sección cortas, filas con chevron, dos columnas (editable / configuración secundaria).
- Marcos nuevos junto a los originales en Figma para comparar antes de reemplazar.

**Falló o se aprendió**
- Cristal y desenfoque **aplicados de forma uniforme** a todas las tarjetas: se pierde jerarquía y cuesta rendimiento en scroll.
- Texto sobre fondos que cambian (manchas animadas) baja la legibilidad.
- Barras laterales de color por estado en tarjetas y filas: recurso de plantilla que hoy se rechaza (sección 2.1).
- Degradado ámbar con glow en todos los botones primarios: el acento deja de ser acento.

**Reglas que deja**: el cristal es una capa, no un material de contenido; el fondo animado nunca va detrás de texto denso; un acento con glow en un solo lugar por pantalla.

### 14.3 SIGT BGA — gestión de transporte urbano (Bucaramanga)

**Contexto.** App de pasajero y conductor (375 px) y centro de control en tablet (960 px con barra lateral): inicio con mapa y buses cercanos, pago QR, dashboard del conductor, centro de control con KPIs, mapa de flota y alertas en tiempo real.

**Funcionó**
- Componentes semánticos de tiempo real: insignias de ETA por estado, indicador de ocupación, QR con anillo pulsante como estado "esperando validación", feed de alertas.
- Escenarios de prueba ligados a pantallas concretas (QR expirado → la app regenera; saldo insuficiente → estado de error propio).
- Cuando el plan Starter de Figma bloqueó la escritura por MCP: **un HTML autocontenido por pantalla** para importar con html.to.design o Anima.

**Falló o se aprendió**
- Un artefacto con varias pantallas en pestañas solo permitió importar la primera: **una pantalla = un archivo**.
- `transition: all` en el código de la época: hoy es una señal que se corrige.
- Íconos de estado con emoji en notas de mockup: hoy prohibido.

**Reglas que deja**: cada estado de negocio (expirado, sin saldo, sin señal) tiene diseño propio; el plan B de entrega se define antes de que falle la herramienta.

### 14.4 Operación Cassandra — CTF gamificado (Electiva en Ciberseguridad)

**Contexto.** "Sistema operativo" web inmersivo con terminal real (xterm.js + puente WebSocket a una VM víctima), cinco misiones, personajes con imágenes propias, reloj de purga, vidas, insignias.

**El momento clave.** El usuario pidió honestidad: la estética "se veía hecha por IA". El diagnóstico que se dio y que vale para cualquier proyecto:
1. **Todo brillaba**: glow en cada texto, borde y tarjeta.
2. **Tipografía sin sistema**: mayúsculas, minúsculas, itálicas y monoespaciada mezcladas sin regla.
3. **Monocromo sin base neutra**: todo verde sobre negro (cliché Matrix); faltaba un "papel" neutro para que el verde fuera acento.
4. **Decoración de más**: lluvia de caracteres, escaneo, glow, todo a la vez.

**Qué pasó después.** Se construyó un rediseño completo industrial ("Tactical Telemetry": concreto, texto hueso, rojo de alerta, verde como señal). El usuario lo **descartó** y se quedó con la identidad original verde/CRT, aplicando pulido encima: scrollbars invisibles, fondo de "canal secreto" en lugar de lluvia de caracteres, ojo de ARGOS que respira, medallas hexagonales por misión con su color e icono, animación de moneda al desbloquear, diálogo en burbujas con avatares de personaje, recorte y limpieza de las imágenes aportadas por el usuario.

**Reglas que deja**
- Lo genérico viene del exceso, no de la falta.
- Primero pulir dentro de la identidad; el rediseño total es una opción que se ofrece, no se impone (sección 3.5).
- El usuario puede aportar sus propios recursos (personajes, íconos); se integran con limpieza técnica (recorte, fondo transparente, sombra coherente), no se sustituyen.
- Un entregable de sustentación DEBE funcionar sin internet: fuentes y librerías autocontenidas, y si una parte falla (la terminal), el resto sigue funcionando.

### 14.5 Infografías del curso de ciberseguridad

**Contexto.** Módulo 1 en HTML con estética terminal (verde sobre oscuro, línea de tiempo vertical) y luego en Canva; Módulo 2 replicando una referencia corporativa azul y blanca aportada por el usuario.

**Reglas que deja**
- Cuando hay una referencia de estilo, se describe con precisión (estructura, paleta, tipo de tarjetas, gráficas, cabecera y pie) y se respeta: la referencia del cliente gana a la estética propia.
- La herramienta de salida la decide el usuario (Canva o HTML); se preguntó por HTML primero y se rehízo en Canva cuando lo pidió.
- En Canva por MCP, los prompts descriptivos (estructura + paleta + contenido por bloque) dan mejores candidatos; las tildes se eliminan en los campos de esquema de presentación para evitar truncamiento.

---

## 15. Historial de feedback convertido en reglas

Cada fila es un par **feedback → corrección → regla general**. Es el material más útil para entrenar criterio.

### 15.1 Escala

| Ronda | Lo que dijo o pidió el cliente | Qué se hizo | Regla que deja |
|---|---|---|---|
| 1–6 | Primeras pantallas y recorrido por estaciones | Pantallas de ambos portales y componentes compartidos | Componentizar desde el principio |
| 7 | Cambio de marca a Escala con el símbolo entregado | Logo trazado a vector, íconos con volumen, Liquid Glass y primer copiloto | Usar siempre el logo real, nunca uno aproximado |
| 9 | Aplicar skills de gusto ignorando lo genérico | Pase de calidad: sombras, mayúsculas, tamaños, emojis cambiados por íconos | Las skills son criterio, no plantilla: se filtran |
| 10 | Brief de 23 secciones | Sistema compartido de materiales y botones, barra contraíble, selector líquido, empresas sin iniciales | Un cambio transversal va al sistema, no a cada pantalla |
| 11 | Acceso como la referencia FOREST LAND; agenda idéntica a la referencia; logo real; verdes del logo en blanco sobre oscuro | Aplicado | "Idéntico" es idéntico; "inspirado" es dirección |
| 12 | Copiloto que se asoma desde el borde; brillo del acceso arriba a la izquierda; quitar el nombre duplicado del héroe; fondos sin cuadrícula; producto con desvanecido realista | Aplicado | Un personaje gana vida cuando se relaciona con la UI |
| 13 | Restaurar el botón "Inicio" blanco | Restaurado | No quitar lo que no se pidió quitar |
| 14 | Restaurar las baldosas del cierre de la landing; cambiar solo eso | Restauradas y nada más | Interpretar el alcance de una regla, no generalizarla |
| 15 | Copiloto más minimalista; en la landing solo añadir cortes entre secciones | Gota con ojos de punto; cortes de transición | "Solo" se toma literal |
| 16 | Chat con lista de empresas al lado; copiloto que se adapta al historial | Tres columnas: empresas, conversación, seguimiento | La IA dentro de la UI tiene contexto visible |
| 17 | Barra del emprendedor más bonita | Doble cápsula con indicador líquido | |
| 18 | "Muy oscura" | Tono medio como el otro portal | El contraste se calibra con el resto del producto |
| 19 | Marco por sección según referencia; no tocar tablas, gráficas ni montaña | Marco por sección | Lo que el cliente blinda no se toca |
| 20 | "Los colores gritan mucho" | Un solo marco con la paleta del otro portal y un piquito pequeño | Menos color y un detalle preciso comunican más |
| 21 | Los pines flotan separados de su palo y empeoran al cambiar el tamaño | Anclaje geométrico en cualquier tamaño | Elementos ligados se calculan juntos |
| 22 | La vista Lista deja un gran espacio en blanco | Panel "Ritmo de tu ruta" con métricas útiles | Un hueco se llena con información, no con decoración |
| 23 | Demasiado espacio entre botones y tarjeta | Botones bajados | |
| 24 | El hito 6 aparece antes que el 5; bajar solo los botones | Orden cronológico corregido; botones a 20 px de la tarjeta | Datos coherentes en el tiempo; mover exactamente lo señalado |

### 15.2 Otros proyectos

| Proyecto | Feedback | Regla |
|---|---|---|
| Cassandra | "Se ve demasiado hecho por IA; sé honesto" | Diagnosticar con precisión (exceso de efectos, tipografía sin sistema, falta de base neutra) antes de proponer |
| Cassandra | Rediseño industrial descartado | Pulir dentro de la identidad antes de reemplazarla |
| Noctua | "Quita lo genérico, mantén el movimiento" | Conservar lo que el cliente valora al rediseñar lo demás |
| Noctua (suite de skills) | "Noctua es un aprendizaje, no el estándar"; "no prohíbas colores" | Los casos no se convierten en estilo por defecto; se rechaza el reflejo, no el color |
| SIGT BGA | "El artefacto solo deja importar la primera pantalla" | Una pantalla = un archivo autocontenido |
| Infografías | "Hazlo en Canva" / "con este estilo de referencia" | La herramienta y la referencia del usuario mandan |

### 15.3 Patrones que se repiten

1. El cliente prefiere **suave e integrado** antes que llamativo.
2. **Alcance literal**: "solo esto" es solo esto.
3. **Nunca quitar algo aprobado** sin que se pida.
4. **Precisión geométrica**: anclajes, alturas iguales y separaciones exactas.
5. **Llenar con función**, no con adorno.
6. **Coherencia de datos** entre pantallas y en el tiempo.
7. **Honestidad**: el usuario pide la verdad sobre la calidad y la valora más que la aprobación.
8. **Menos efectos, mejor ejecutados.**

---

## 16. Skills: cuáles usar, cuándo y qué filtrar

Las skills aportan criterio y técnica. Ninguna se aplica completa sin filtrar: varias contienen reglas que chocan con este documento. **Cuando una skill contradice este playbook, gana el playbook** (sección 0.4).

### 16.1 Suite propia: `frontend-craft-suite` (Claude Code)

Paquete instalable como plugin (`/plugin marketplace add <ruta>` y `/plugin install frontend-craft-suite@santiago-frontend`) o con `python install.py --with-vendor`. Contiene 23 skills, 16 comandos, agentes de revisión y un hook de lint. Su contrato interno (`docs/SUITE-SPEC.md`) comparte el perfil de gusto de este documento.

| Bloque | Skills | Para qué |
|---|---|---|
| Dirección | `fe-director`, `fe-philosophy`, `fe-art-direction` | Punto de entrada y enrutamiento; principios y rechazos; más de 20 mundos visuales con cuándo usarlos y sitios de referencia |
| Base visual | `fe-typography`, `fe-color`, `fe-layout-spacing`, `fe-design-tokens` | Escalas y carga de fuentes; OKLCH, rampas, WCAG y APCA con generador; grid y ritmo; tokens en CSS, DTCG y Tailwind v4 |
| Expresión | `fe-icons-imagery`, `fe-motion`, `fe-effects-materials`, `fe-3d-webgl` | Librerías de íconos y reglas; easing, springs, View Transitions, scroll-driven; Liquid Glass (técnicas web y nativa), sombras, ruido; three.js WebGPU, R3F, Spline |
| Producto | `fe-components`, `fe-ux-patterns`, `fe-data-viz`, `fe-ai-ux`, `fe-ux-writing`, `fe-brand-marketing` | Anatomía y estados; leyes y patrones; gráficas honestas; interfaces con IA; microcopy es-CO; landing, SEO y prueba social honesta |
| Calidad | `fe-accessibility`, `fe-performance`, `fe-qa-review`, `fe-figma-handoff` | WCAG 2.2; Core Web Vitals; rúbrica y regresión visual; Figma MCP y HTML por pantalla |
| Plataforma | `fe-stacks`, `fe-platforms-mobile` | React/Next, Vue, Svelte, Angular, Astro, Solid, Qwik, Laravel, vanilla; PWA, iOS 26, Material 3, React Native, Flutter |

Comandos: `/fe-new`, `/fe-brief`, `/fe-variants`, `/fe-critique`, `/fe-audit`, `/fe-polish`, `/fe-palette`, `/fe-type`, `/fe-motion`, `/fe-glass`, `/fe-3d`, `/fe-tokens`, `/fe-break`, `/fe-shots`, `/fe-handoff`, `/fe-lint`.

Agentes: crítico de diseño, auditor de accesibilidad, auditor de rendimiento y revisor de movimiento (independientes, no editan archivos); `fe-builder` en Sonnet (corresponde a `[SWITCH_SONNET]`) y `fe-scout` en Haiku (corresponde a `[SWITCH_HAIKU]`).

Hook `fe_lint.py`: tras cada edición señala emojis, `img` sin `alt`, zoom bloqueado, `transition: all`, `scale(0)`, `ease-in`, `100vh`, listeners de scroll, `z-index` arbitrario, bordes laterales gruesos, `div` clicable, copy de relleno y datos genéricos.

Límites conocidos de la suite: la demo de Liquid Glass solo se verificó en Chromium; el render WebGPU cayó a WebGL 2 en el entorno de prueba; conteos y licencias de librerías de íconos quedaron sin verificar contra sus sitios oficiales.

### 16.2 Skills de criterio y técnica (cuenta del usuario)

| Skill | Usar para | Filtrar o ignorar |
|---|---|---|
| `emil-design-eng` | Decisiones de animación (frecuencia, easing, duración), botones, popovers, tooltips, gestos, revisión de movimiento. Base de la sección 7 | Nada relevante; es la referencia de movimiento |
| `design-taste-frontend` | Catálogo de señales de IA, diales VARIANCE / MOTION / DENSITY, arsenal de layouts | **Ignorar**: prohibición de Inter (la marca puede pedirla); "números orgánicos" tipo 47,2 % (siguen siendo datos inventados); placeholders de picsum (rompen el autocontenido); el bento con movimiento perpetuo fuera de Persuadir |
| `high-end-visual-design` | Arquetipos de alto nivel (vidrio etéreo, lujo editorial), doble bisel, botones con icono anidado, reglas de rendimiento del blur | **Ignorar**: lista de fuentes prohibidas (Escala usó Open Sans por marca y fue correcto); eyebrow obligatorio sobre cada título; `transition-all duration-700`; entradas de 800 ms con desenfoque en todo; prohibición de barras de navegación fijas (válidas en Operar) |
| `redesign-existing-projects` | Auditar un proyecto existente y subirlo de nivel sin romper funcionalidad | Aplicar el principio de la sección 3.5: pulir dentro de la identidad primero |
| `minimalist-ui` | Mundo editorial cálido, monocromo, bento plano | Es una dirección, no un valor por defecto |
| `industrial-brutalist-ui` | Mundo técnico/militar, rejillas rígidas, contraste tipográfico extremo | Mismo caso; en Cassandra se probó y el cliente prefirió su identidad |
| `gpt-taste` | Landing con GSAP (pin, scrub, stacking), estructura AIDA | **Ignorar** la "aleatorización" de layouts: el layout se decide por el producto, no al azar. Solo en Persuadir |
| `stitch-design-taste` | Generar `DESIGN.md` legibles por agentes | **Ignorar** microinteracciones perpetuas en componentes de dashboard (contradice la regla de frecuencia) |
| `ui-ux-pro-max` | Consulta de estilos, paletas, pares tipográficos, guías UX y tipos de gráfico por stack | Usar como catálogo; elegir con criterio, no por primera coincidencia |
| `web-design-guidelines` | Auditoría de código de UI contra guías de interfaz web | Ninguno |
| `vercel-react-best-practices`, `frontend-patterns` | Rendimiento y patrones en React / Next.js | Verificar contra la versión real del proyecto |
| `frontend-design` (Anthropic) | Dirección estética intencional en trabajo nuevo | Ninguno |
| `design-system` / `ckmdesign-system` / `ckmui-styling` | Auditar o extender un sistema de diseño, coherencia de tokens | Ninguno |
| `full-output-enforcement` | Entregas de código largas sin truncar ni dejar "TODO" | Ninguno |
| `image-to-code`, `imagegen-frontend-web`, `imagegen-frontend-mobile` | Generar referencias visuales por sección antes de implementar, cuando el entorno puede generar imágenes | Si no hay generador de imágenes, omitir |
| `figma-use`, `figma-implement-design`, `figma-generate-design`, `figma-generate-library`, `figma-create-design-system-rules`, `figma-code-connect` | Trabajo en Figma por MCP | Ver sección 17.1 |
| `dataviz` | Cualquier gráfico, KPI o dashboard | Ninguno |
| Plugin `design`: `accessibility-review`, `design-critique`, `design-handoff`, `ux-copy`, `design-system` | Auditoría WCAG, crítica estructurada, especificación para desarrollo, microcopy | Ninguno |
| `react-native-design` | Interfaces móviles en React Native | Respetar patrones de plataforma |

### 16.3 Skills usadas en el entorno del proyecto Escala

En el repositorio de Escala se trabajó con una suite local (`.claude/skills/`: `fe-philosophy`, `fe-art-direction`, `fe-color`, `fe-typography`, `fe-layout-spacing`, `fe-effects-materials`, `fe-motion`, `fe-data-viz`, `fe-qa-review`, `fe-3d-webgl`) más `impeccable` (modos de superficie, pulido, endurecimiento de estados), `apple-design` (movimiento fluido, materiales) y el grupo de animación `animate`, `review-animations`, `improve-animations`, `animation-vocabulary`. En la ronda 9 se aplicaron taste-skill, las agent-skills de Vercel, awesome-design-md e imagegen-skills, filtrando lo genérico.

### 16.4 Orden de carga por tarea

| Tarea | Orden |
|---|---|
| Producto nuevo | `fe-director` → `fe-philosophy` → `fe-art-direction` → `fe-design-tokens` + `fe-color` + `fe-typography` → `fe-components` → `fe-qa-review` |
| Landing | `fe-brand-marketing` → `fe-art-direction` → `fe-motion` (+ `gpt-taste` filtrado si hay GSAP) → `fe-performance` |
| Dashboard / panel | `fe-ux-patterns` → `fe-components` → `dataviz` / `fe-data-viz` → `fe-accessibility` |
| Rediseño de algo existente | `redesign-existing-projects` → `fe-qa-review` (diagnóstico) → skill del área débil |
| Animación | `emil-design-eng` → `fe-motion` → agente revisor de movimiento |
| Cristal | `fe-effects-materials` → `fe-performance` |
| 3D | `fe-3d-webgl` → `fe-performance` |
| Figma | `figma-use` → skill de Figma específica → `fe-figma-handoff` |
| Antes de entregar | `fe-qa-review` → `fe-accessibility` → `web-design-guidelines` |

Las skills se cargan **después** de reunir el material (brief, referencias, datos). Cargadas primero, empujan hacia plantillas cuando todavía no hay nada que poner en ellas.

---

## 17. Herramientas y entrega

### 17.1 Figma por MCP

- Leer estructura antes de crear (`get_metadata` con el `nodeId`).
- `await figma.setCurrentPageAsync(page)` antes de crear nodos en una página.
- Precargar todos los pesos de fuente al inicio de cada script (`Bold`, `Semi Bold`, `Medium`, `Regular`, `Light`).
- Marcos nuevos en incrementos de `x = 1500` respecto a los existentes para no solapar; el original queda al lado para comparar.
- `textAutoResize = "WIDTH_AND_HEIGHT"` inmediatamente después de asignar el texto.
- `BACKGROUND_BLUR` requiere `clipsContent = false` en el marco para verse.
- Degradados con `gradientTransform` calculado desde el ángulo en grados.
- Captura con `get_screenshot` después de cada bloque grande para validar.
- **Plan Starter**: limita llamadas por sesión y no se resuelve subiendo de plan a mitad de sesión. Plan B: un HTML autocontenido por pantalla para importar con html.to.design o Anima.

### 17.2 Canva por MCP

- Prompts descriptivos: estructura, paleta, tipo de tarjetas, gráficas, cabecera, pie y contenido por bloque.
- En `generate-design-structured`, quitar tildes y eñes de los valores del esquema de presentación para evitar truncamiento silencioso.
- Canva genera candidatos; el usuario elige y edita.

### 17.3 Entregables

| Formato | Reglas |
|---|---|
| HTML de mockup | Autocontenido (CSS, JS, SVG y fuentes embebidos o locales), una pantalla por archivo si va a Figma, verificado con red bloqueada |
| Proyecto con código | Leer el stack real antes de escribir sintaxis de versión; verificar que cada dependencia existe; dar el comando de instalación si falta |
| Repositorio | Commits y push solo si el usuario lo pide; ramas y pull request hacia la rama de integración del equipo |
| Documentación de diseño | `PRODUCT.md`, `DESIGN.md`, fichas de animación, índice de pantallas con estados y datos |

### 17.4 Navegadores y entornos

- Verificar en Chromium como base; declarar en el informe si no se probó Safari o Firefox (el cristal y algunos selectores modernos se comportan distinto).
- `localStorage` siempre dentro de `try/catch` y solo para preferencias ligeras del visitante.
- Nada depende de un CDN cuando el entregable se presenta sin red.

---

## 18. Bloque de configuración para el agente

Copiar en `CLAUDE.md` (global o del proyecto) y completar la sección "Producto".

```text
ROL
Diseñador/a de producto y desarrollador/a frontend senior. El resultado debe verse como el de una empresa de producto, nunca como una plantilla generada.

ESTILO DE RESPUESTA
- Sin preámbulos, despedidas ni narración del proceso. Lenguaje profesional llano, sin expresiones idiomáticas.
- Tareas complejas: "1. Plan Estratégico" y "2. Instrucciones de Implementación" en un único flujo.
- Marcar [SWITCH_SONNET] en generación mecánica o código extenso y [SWITCH_HAIKU] en lectura de archivos, logs o consultas simples.
- Informar siempre qué cambió, qué se verificó y qué no.

CRITERIO
- Cada valor visible (fuente, color, radio, sombra, duración, layout) es una decisión justificable en una frase. Ningún valor por defecto sin revisar.
- La función manda: cristal, blur, brillo, degradados y animación solo si comunican jerarquía, estado, material o una atmósfera elegida. Un momento firma por superficie. Menos efectos, mejor ejecutados.
- Ningún color ni fuente está prohibido; está prohibido el reflejo sin intención. La marca del cliente manda.
- Prohibido: emojis; datos, métricas, testimonios o logos inventados (usar datos simulados coherentes o "[pendiente]"); copy de relleno; hero centrado con dos botones y tres tarjetas iguales; texto con degradado; glow en todo; cristal sobre cristal; bordes grises de 1 px como único separador; bordes laterales gruesos de color; todo en píldora; fondos de cuadrícula; transition: all; ease-in en entradas; scale(0).
- Separar con espacio, luego superficie, luego sombra suave, por último hairline. Radios concéntricos. Píldora solo en controles.

SISTEMA
- Tokens primero (primitivo -> semántico -> componente) y usados en todas partes. Rampas en OKLCH, neutros tintados, texto casi negro, un acento con función, colores reservados con significado.
- Tipografía por voz del producto, escala con pasos claros, tracking negativo en titulares, tabular-nums en cifras, text-wrap balance/pretty, fuentes autocontenidas si el entregable puede ir sin red.
- Cristal en tres variantes como máximo, siempre sobre fondo visible, con borde de luz enmascarado y fallbacks (@supports, prefers-reduced-transparency, forced-colors). Usar :is(...) para listas de clases; ".glass-*" no es un selector válido.

ESTADOS Y ACCESIBILIDAD (WCAG 2.2 AA)
- Controles: reposo, hover (solo con @media (hover:hover) and (pointer:fine)), foco doble visible a 3:1, presión scale(.97), carga sin cambio de ancho (aria-busy + aria-disabled), deshabilitado y confirmación.
- Vistas: carga (skeleton), vacío, error con causa y recuperación conservando lo escrito, éxito, sin permisos, offline, contenido extremo.
- Contraste 4.5:1 texto, 3:1 texto grande, controles y foco. Objetivos mínimos 24 px, 44 px en táctil. Escape cierra y devuelve el foco. Tooltips con hover y foco, descartables. Acordeones cerrados inertes. Arrastre con alternativa de botones. ARIA coherente con lo visual.

MOVIMIENTO
- Decidir por frecuencia: lo de uso constante no se anima; acciones de teclado nunca.
- transform y opacity para movimiento; color y sombra permitidos en hover de elementos pequeños; nunca transition: all.
- Entradas ease-out cubic-bezier(0.23,1,0.32,1); desplazamientos cubic-bezier(0.32,0.72,0,1). Respuestas < 300 ms; expansiones 280-380 ms; salidas más rápidas que entradas.
- Lo que se abre nace de su origen. Todo interrumpible (transiciones, no keyframes, en UI repetible). Escalonado 30-80 ms.
- prefers-reduced-motion con alternativa diseñada. Animaciones continuas pausadas fuera de pantalla.

PROCESO
- Leer todo el brief, las referencias, PRODUCT.md y DESIGN.md. "Idéntico" es idéntico; "inspirado" es dirección.
- Cambiar exactamente lo pedido. "Solo X" es solo X. Nunca quitar algo aprobado.
- Si algo "se ve genérico": diagnosticar con precisión y pulir dentro de la identidad antes de proponer un rediseño total.
- Cambios transversales al sistema, no a cada pantalla.
- Verificar con capturas en 390, 768, 1280 y 1440 (y 1366 si aplica), 0 errores de consola, 0 overflow, movimiento reducido, medidas críticas. Revisor independiente en entregas de alto riesgo.
- Registrar cada preferencia nueva del cliente en DESIGN.md.

PRODUCTO (completar)
- Nombre, audiencia y modo por superficie (persuadir / experiencia / operar / leer):
- Marca: paleta, fuente, logo:
- Reglas de negocio: quién aprueba qué, colores reservados, qué no se dibuja:
- Datos de demostración:
- Entrega: formato, navegadores y anchos objetivo:
```

---

## 19. Checklist final

**Criterio**
- [ ] Cada decisión visible tiene una razón.
- [ ] Pasa la prueba del logo.
- [ ] Cero emojis; íconos de un solo sistema.
- [ ] Cero datos inventados; cifras coherentes entre pantallas y en el tiempo.
- [ ] Un solo momento firma por superficie; ningún efecto aplicado a todo.

**Sistema**
- [ ] Tokens usados en todas partes; ningún hex suelto repetido.
- [ ] Separación por espacio y superficie antes que por bordes; radios concéntricos; píldora solo en controles.
- [ ] Contraste real verificado: texto 4.5:1, texto grande / controles / foco 3:1.
- [ ] Cristal solo sobre fondo visible, nunca anidado, con los tres fallbacks.
- [ ] Fuentes y recursos autocontenidos si el entregable puede ir sin red.

**Componentes y estados**
- [ ] Todos los estados de cada control diseñados (incluida carga sin cambio de ancho).
- [ ] Todos los estados de cada vista diseñados (vacío, carga, error, éxito, permisos, offline, extremo).
- [ ] Formularios conservan lo escrito ante cualquier error.

**Accesibilidad**
- [ ] Foco visible en todas las superficies; Escape y retorno de foco.
- [ ] Objetivos ≥ 24 px (44 px en táctil); arrastre con alternativa.
- [ ] ARIA coherente con lo visual; contenido cerrado inerte.
- [ ] Funciona con teclado de principio a fin y al 200 % de zoom.

**Movimiento**
- [ ] Decidido por frecuencia; nada en acciones de teclado.
- [ ] Propiedades correctas, sin `transition: all`, sin `ease-in`, sin `scale(0)`.
- [ ] Hover solo con puntero fino.
- [ ] Alternativa de movimiento reducido diseñada y probada.

**Verificación y entrega**
- [ ] Capturas en todos los anchos objetivo, 0 errores, 0 overflow, 0 peticiones externas si es autocontenido.
- [ ] Solo se cambió lo pedido; nada aprobado se perdió.
- [ ] `DESIGN.md` actualizado con las preferencias nuevas.
- [ ] El informe dice qué se verificó y qué no.

---

## 20. Puesta en marcha en Claude Code

Arquitectura recomendada, pensada para ahorrar contexto:

| Pieza | Dónde vive | Cuándo se carga |
|---|---|---|
| Reglas cortas (bloque de la sección 18) | `CLAUDE.md` | En cada sesión, siempre |
| Este playbook completo | Skill personal `frontend-craft-playbook` | Solo cuando la tarea es de frontend o diseño |
| Suite `frontend-craft-suite` (opcional) | Plugin | Por skill, comando o agente |
| Memoria del proyecto | `PRODUCT.md` y `DESIGN.md` en la raíz del repo | Al inicio de cada sesión del proyecto |
| Script de QA | `scripts/qa-check.mjs` en el repo | Antes de cada entrega |

No se importa el playbook completo dentro de `CLAUDE.md` (con `@archivo`): son unas 14.000 palabras que se cargarían en todas las sesiones, incluso las que no son de frontend.

### 20.1 Requisitos

- Claude Code instalado y autenticado (`claude --version` responde).
- Node.js LTS y Git.
- Rutas de configuración:

| Sistema | Carpeta personal de Claude Code |
|---|---|
| Windows | `%USERPROFILE%\.claude\` (por ejemplo `C:\Users\<usuario>\.claude\`) |
| macOS / Linux | `~/.claude/` |

### 20.2 Paso 1: reglas globales en `CLAUDE.md`

1. Abrir o crear `~/.claude/CLAUDE.md` (en Windows, `%USERPROFILE%\.claude\CLAUDE.md`).
2. Pegar el bloque de texto de la sección 18 completo.
3. Dejar la parte "PRODUCTO" vacía en el archivo global. Se llena en el `CLAUDE.md` de cada proyecto (en la raíz del repositorio), que se suma al global.
4. Añadir al final del archivo global:

```text
CRITERIO COMPLETO
- Para cualquier tarea de frontend, UI, UX, diseño o animación, cargar la skill frontend-craft-playbook antes de diseñar o escribir código.
- Si una skill de terceros contradice esa skill, gana frontend-craft-playbook.
```

5. Verificar dentro de Claude Code con `/memory`: debe listar el `CLAUDE.md` personal.

### 20.3 Paso 2: el playbook como skill personal

1. Crear la carpeta `~/.claude/skills/frontend-craft-playbook/` (en Windows, `%USERPROFILE%\.claude\skills\frontend-craft-playbook\`).
2. Copiar este archivo dentro de esa carpeta con el nombre `playbook.md`.
3. Crear en la misma carpeta un archivo `SKILL.md` con este contenido:

```markdown
---
name: frontend-craft-playbook
description: Criterio, sistema y proceso para diseñar y construir frontend de calidad (UI, UX, tokens, Liquid Glass, componentes, estados, animación, accesibilidad, QA). Usar en cualquier tarea de frontend, rediseño, mockup, landing, dashboard o revisión visual.
---

# Frontend Craft Playbook

Leer `playbook.md` (en esta carpeta) antes de diseñar o escribir código de interfaz.

Orden mínimo de lectura según la tarea:
- Siempre: secciones 0, 1, 2 y 3.
- Sistema visual nuevo: 4 y 5.
- Componentes y pantallas: 6, 7, 8 y 9.
- Antes de entregar: 11, 13 y 19.
- Elegir otras skills: 16.

Reglas que nunca se omiten: sin emojis, sin datos inventados, cambiar solo lo pedido, verificar con capturas antes de decir que algo está listo.
```

4. Reiniciar Claude Code y verificar que la skill aparece (preguntando "¿qué skills tienes disponibles?" o abriendo el menú de skills).

### 20.4 Paso 3 (opcional): suite `frontend-craft-suite`

Solo si se tiene el zip de la suite (no viene dentro de este documento):

1. Descomprimir en una ruta fija, por ejemplo `~/dev/frontend-craft-suite`.
2. Dentro de Claude Code:

```text
/plugin marketplace add ~/dev/frontend-craft-suite
/plugin install frontend-craft-suite@santiago-frontend
```

   Alternativa sin plugin: `python install.py --with-vendor` desde la carpeta de la suite (en Windows `py install.py --with-vendor`; `--uninstall` revierte).
3. Reiniciar Claude Code y probar `/fe-brief`.
4. Si se instala la suite, el bloque de la sección 18 no se duplica: si `templates/CLAUDE.md` de la suite ya está en el `CLAUDE.md` global, basta con añadir las dos líneas de "CRITERIO COMPLETO" del paso 1.

Sin la suite, el playbook funciona solo: los comandos `/fe-*` y los agentes no estarán, pero las reglas sí.

### 20.5 Paso 4: preparar cada proyecto

En la raíz del repositorio:

1. `CLAUDE.md` del proyecto con la parte "PRODUCTO" de la sección 18 llena y el stack real.
2. `PRODUCT.md` y `DESIGN.md` con las plantillas de la sección 3.3.
3. Script de QA:

```text
mkdir scripts
(guardar el script de la sección 13.1 como scripts/qa-check.mjs)
npm i -D playwright
npx playwright install chromium
node scripts/qa-check.mjs ruta/a/pagina.html --out qa-out
```

4. Opcional, accesibilidad automática: `npm i -D @axe-core/playwright`.
5. Añadir `qa-out/` al `.gitignore`.

### 20.6 Prueba de humo

Pedir en Claude Code, dentro de un proyecto de prueba:

```text
Diseña una pantalla de inicio de sesión para una app de reservas de canchas. Modo experiencia. Entrega HTML autocontenido y verifícalo.
```

El resultado es correcto si el agente:
- Carga la skill `frontend-craft-playbook` (o lo dice al empezar).
- Responde con "1. Plan Estratégico" y "2. Instrucciones de Implementación".
- Entrega sin emojis, con estados de error, carga y "Mostrar" contraseña, foco visible y movimiento reducido.
- Ejecuta el script de QA y reporta errores, overflow y peticiones externas en 0.
- Dice qué verificó y qué no.

Si no carga la skill sola, revisar que la `description` del `SKILL.md` está intacta y que el `CLAUDE.md` global tiene las líneas del paso 1.

### 20.7 Mantenimiento

- Cuando el cliente o el usuario da una corrección nueva, se anota en el `DESIGN.md` del proyecto.
- Si la corrección es general (sirve para cualquier proyecto), se añade a la sección 15 de `playbook.md` y, si es una regla dura, al bloque de `CLAUDE.md`.
- Una sola fuente de verdad: si se edita el playbook, se reemplaza el `playbook.md` de la carpeta de la skill.

---

## Anexo A. Auditoría de la guía de Escala (versión 1)

Revisión de la guía original contra este playbook, con medición de contraste (fórmula WCAG 2.x) y prueba de los fragmentos de código en Chromium mediante Playwright.

### A.1 Defectos encontrados y corrección aplicada

| # | Hallazgo | Evidencia | Corrección en este documento |
|---|---|---|---|
| 1 | Anillo de foco naranja insuficiente sobre superficies claras | `#E9A427` sobre `#FFFFFF` = 2,14:1; sobre `#F4F8F6` = 2,00:1 (mínimo 3:1, WCAG 1.4.11) | Anillo doble: naranja por fuera + `#00281C` por dentro (15,91:1 contra blanco) — sección 6.1 |
| 2 | Contorno de inputs por debajo de 3:1 | `#BEC4C2` = 1,77:1 y `#CBD2CF` = 1,54:1 sobre blanco | Para contornos que identifican un control: `#858D8A` (3,40:1 sobre blanco, 3,18:1 sobre `#F4F8F6`) o más oscuro — sección 4.6 |
| 3 | Anillo de seleccionado débil si es el único indicador | `#5EBB9A` = 2,32:1 sobre blanco | Acompañar con cambio de fondo o peso, o usar `#008E6C` (4,13:1) |
| 4 | Selector CSS inválido | `.glass-*{…}` no existe en CSS; el navegador descarta la regla y el fallback nunca se aplica (verificado: `querySelector` lanza error de sintaxis) | `:is(.glass-nav,.glass-float,.glass-hero)` — sección 5.3 |
| 5 | Acordeón cerrado con contenido enfocable | Con `grid-template-rows: 0fr` el enlace interno seguía recibiendo foco | `inert` en el contenido cerrado (verificado: no enfocable cerrado, enfocable abierto) — sección 6.5 |
| 6 | Hover sin consulta de puntero | Hover se quedaba "pegado" en táctil | `@media (hover:hover) and (pointer:fine)` — secciones 6.2 y 7.5 |
| 7 | Botón en carga sin bloqueo de doble envío | Solo `aria-busy` | `aria-busy` + `aria-disabled` y guarda en JS (verificado: ancho idéntico, 98,59 px antes y durante la carga) — sección 6.2 |
| 8 | Contradicción interna de movimiento | La regla decía "solo transform y opacity", pero el selector anima `left`/`right` y los botones `background-color` y `box-shadow` | Reglas explícitas de propiedades y excepciones justificadas, con `contain: layout paint` en la pista — secciones 6.4 y 7.4 |
| 9 | Contradicción de duraciones | Regla "< 300 ms" frente a acordeón de 380 ms e indicador de 440 ms | Tabla por tipo de movimiento con las excepciones razonadas — sección 7.3 |
| 10 | Tamaño táctil citado como requisito AA | "44 px" se presentaba como mínimo WCAG 2.2 AA | AA exige 24 × 24 px (2.5.8); 44 px es la recomendación — sección 11 |
| 11 | Tooltip incompleto | Faltaba descartar con Escape y permitir pasar el puntero sobre él | Requisitos de WCAG 1.4.13 — sección 6.6 |
| 12 | Semántica del selector ambigua | "`aria-pressed` o `aria-selected`" sin criterio | Tabla: cambia de vista → pestañas; filtra → botones conmutables o `radiogroup` — sección 6.4 |
| 13 | Numeración interna incorrecta | El texto inicial decía que la sección 11 era el prompt y que 9 y 10 eran generales; el índice ponía el prompt en la 13 | Documento renumerado y generalizado |
| 14 | Verificación sin tablet | Solo 1440, 1366 y 390 | 390, 768, 1280, 1440 (+1366 si aplica) — sección 4.7 |

### A.2 Lo que faltaba y se añadió

| Faltaba | Dónde está ahora |
|---|---|
| Arquitectura de tokens en tres capas y fuente de verdad | 4.1 |
| Método de color en OKLCH, roles completos, modo oscuro y tabla de umbrales | 4.2 |
| Criterio para elegir y combinar familias tipográficas; carga sin CLS; fuentes autocontenidas | 4.3 |
| Escala de `z-index` como tokens | 4.6 |
| Formularios: validación, errores, autenticación accesible, formatos tolerantes | 6.3 |
| Modales, drawers, toasts, tablas | 6.7–6.9 |
| Estados offline, sin permisos y contenido extremo | 6.10 |
| Marco de decisión del movimiento por frecuencia | 7.1 |
| Copy es-CO, formatos de fecha y moneda, palabras prohibidas, datos de demostración | 9 |
| Principios de interfaces con IA | 9.4 |
| Presupuestos de rendimiento y reglas de 3D | 10 |
| WCAG 2.2 completo (2.4.11, 2.5.7, 2.5.8, 3.2.6, 3.3.7, 3.3.8, 1.4.13) | 11 |
| Responsive y plataformas nativas | 12 |
| Script de QA ejecutable y probado; axe-core; revisor independiente | 13 |
| Casos Noctua, SIGT BGA, Operación Cassandra e infografías | 14 |
| Feedback de otros proyectos convertido en reglas | 15.2 |
| Mapa completo de skills con lo que se filtra de cada una y orden de carga | 16 |
| Patrones de Figma MCP, Canva MCP y reglas de entrega | 17 |
| Memoria de proyecto (`PRODUCT.md`, `DESIGN.md`) y protocolo de variantes | 3.3, 3.4 |

### A.3 Lo que la guía de Escala ya cumplía bien

Sistema antes que pantallas; paleta con roles y colores reservados; sombras en capas tintadas; contornos como sombra interna; borde de luz enmascarado; botones con carga sin cambio de ancho; selector líquido de dos bordes; acordeón sin JavaScript; popovers desde su origen; movimiento reducido diseñado; QA con red bloqueada; historial de rondas con regla por corrección. Todo eso se conserva en este documento.

---

## Anexo B. Tokens de Escala como referencia de nivel

Ejemplo real de una paleta completa con roles. No es un valor por defecto para otros proyectos.

```css
/* Verdes de marca (CDE UNAB) */
--esc-green-950:#00281C; --esc-green-900:#003C2C; --esc-green-850:#0B4A39; --esc-green-800:#00523D;
--esc-green-700:#006B51; --esc-green-650:#12765C; --esc-green-600:#008E6C; --esc-green-500:#2CA27F;
--esc-green-400:#5EBB9A; --esc-green-300:#92D3BA; --esc-green-200:#BEE5D5; --esc-green-100:#DFF2EA; --esc-green-50:#F0F9F5;
/* Acento con función */
--esc-orange-500:#E9A427; --esc-orange-300:#F7C566; --esc-orange-100:#FDF0D9; --esc-orange-50:#FDF6EC;
--esc-orange-ink:#7A5200; --esc-orange-on:#2E1C00;
/* Reservado: credenciales, diagnóstico, copiloto */
--esc-purple-500:#8600DD; --esc-purple-300:#B983FF; --esc-purple-100:#F1E8FF; --esc-purple-ink:#5C0B99; --esc-purple-800:#4E0A85;
/* Neutros tintados */
--esc-ink-900:#1E2120; --esc-ink-700:#414644; --esc-ink-600:#575C5A;
--esc-line-200:#E2E7E5; --esc-line-card:#E3E9E6; --esc-line-control:#858D8A; /* corregido: antes #BEC4C2 (anillo de input) y #CBD2CF (línea de input) */
--esc-surface-200:#EEF2F0; --esc-ground:#F4F8F6; --esc-white:#FFFFFF;
/* Estado */
--esc-danger-600:#B42318; --esc-danger-50:#FEF3F2; --esc-info-600:#1D4ED8; --esc-info-50:#EFF4FF;
/* Foco (corregido: anillo doble) */
--esc-focus-outer:#E9A427; --esc-focus-inner:#00281C;
```

Contrastes verificados de los pares principales:

| Par | Contraste | Resultado |
|---|---|---|
| Texto `#575C5A` sobre `#F4F8F6` | 6,36:1 | Cumple texto normal |
| Blanco sobre primario `#006B51` | 6,52:1 | Cumple |
| Blanco sobre marco `#0B4A39` | 10,23:1 | Cumple |
| `#7A5200` sobre `#FDF0D9` | 6,14:1 | Cumple |
| `#2E1C00` sobre `#E9A427` | 7,65:1 | Cumple |
| Morado `#8600DD` sobre blanco | 6,87:1 | Cumple |
| `#B42318` sobre `#FEF3F2` | 6,05:1 | Cumple |
| Naranja de foco sobre marco `#0B4A39` | 4,78:1 | Cumple |
| Naranja de foco sobre blanco | 2,14:1 | No cumple solo; resuelto con anillo doble |
| Contorno de input `#BEC4C2` sobre blanco | 1,77:1 | No cumple; sustituido por `#858D8A` (3,40:1) |

