// ============================================================
// MOCK DATA — courses.ts
// TODO: Replace with API/database calls when backend is ready.
// Each field maps directly to a DB column for easy migration.
// ============================================================

export type Level = 'Principiante' | 'Intermedio' | 'Avanzado'
export type Badge = 'Nuevo' | 'Popular' | 'Destacado' | null

export interface Lesson {
  id: string
  title: string
  duration: string // e.g. "12:34"
  videoUrl: string // YouTube embed or placeholder
  description: string
  resources: Resource[]
}

export interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

export interface Resource {
  id: string
  title: string
  type: 'pdf' | 'doc' | 'link' | 'template'
  url: string
}

export interface Course {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  level: Level
  duration: string
  badge: Badge
  thumbnail: string
  description: string
  instructor: string
  rating: number
  students: number
  modules: Module[]
  aiGuideSlug?: string // related AI guide
}

export const CATEGORIES = [
  'Todos',
  'Democracia',
  'Derechos Humanos',
  'Participación Ciudadana',
  'Gobernanza Digital',
  'Ética Pública',
  'Transparencia',
]

export const courses: Course[] = [
  {
    id: '1',
    slug: 'democracia-digital',
    title: 'Democracia Digital en el Siglo XXI',
    subtitle: 'Entiende cómo la tecnología transforma la participación ciudadana',
    category: 'Democracia',
    level: 'Principiante',
    duration: '4h 30min',
    badge: 'Popular',
    thumbnail: '/images/course-democracy.jpg',
    description:
      'Un recorrido profundo por los mecanismos democráticos modernos y cómo las herramientas digitales amplían la voz ciudadana. Aprenderás a evaluar fuentes, participar en consultas públicas y usar plataformas de gobierno abierto.',
    instructor: 'Dra. Ana Martínez',
    rating: 4.8,
    students: 3241,
    aiGuideSlug: 'analisis-fuentes-informacion',
    modules: [
      {
        id: 'm1',
        title: 'Fundamentos de la Democracia',
        lessons: [
          {
            id: 'l1',
            title: 'Qué es la democracia y por qué importa',
            duration: '14:22',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Exploramos los principios fundamentales de la democracia moderna y su evolución histórica.',
            resources: [
              { id: 'r1', title: 'Guía de fundamentos democráticos', type: 'pdf', url: '#' },
              { id: 'r2', title: 'Mapa conceptual interactivo', type: 'link', url: '#' },
            ],
          },
          {
            id: 'l2',
            title: 'Sistemas democráticos comparados',
            duration: '18:45',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Comparamos diferentes modelos democráticos alrededor del mundo.',
            resources: [
              { id: 'r3', title: 'Tabla comparativa de sistemas', type: 'pdf', url: '#' },
            ],
          },
          {
            id: 'l3',
            title: 'La crisis de la democracia representativa',
            duration: '21:10',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Analizamos los desafíos actuales y cómo la ciudadanía puede responder.',
            resources: [],
          },
        ],
      },
      {
        id: 'm2',
        title: 'Participación Digital',
        lessons: [
          {
            id: 'l4',
            title: 'Plataformas de gobierno abierto',
            duration: '16:08',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Conoce las principales plataformas de participación ciudadana digital.',
            resources: [
              { id: 'r4', title: 'Directorio de plataformas', type: 'link', url: '#' },
            ],
          },
          {
            id: 'l5',
            title: 'Peticiones y consultas públicas',
            duration: '12:55',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Aprende a redactar y presentar peticiones ciudadanas efectivas.',
            resources: [
              { id: 'r5', title: 'Plantilla de petición ciudadana', type: 'template', url: '#' },
            ],
          },
        ],
      },
      {
        id: 'm3',
        title: 'Evaluación de Información',
        lessons: [
          {
            id: 'l6',
            title: 'Detectar desinformación y fake news',
            duration: '19:33',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Herramientas y técnicas para verificar la información en el entorno digital.',
            resources: [
              { id: 'r6', title: 'Checklist de verificación de fuentes', type: 'pdf', url: '#' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    slug: 'derechos-humanos-fundamentales',
    title: 'Derechos Humanos Fundamentales',
    subtitle: 'Conoce, defiende y ejerce tus derechos como ciudadano',
    category: 'Derechos Humanos',
    level: 'Principiante',
    duration: '3h 15min',
    badge: 'Nuevo',
    thumbnail: '/images/course-rights.jpg',
    description:
      'Curso introductorio al sistema internacional de derechos humanos. Aprende sobre los tratados principales, mecanismos de denuncia y cómo aplicar estos principios en tu vida cotidiana y comunidad.',
    instructor: 'Prof. Carlos Rivera',
    rating: 4.9,
    students: 2180,
    modules: [
      {
        id: 'm1',
        title: 'Marco Internacional de DDHH',
        lessons: [
          {
            id: 'l1',
            title: 'La Declaración Universal de DDHH',
            duration: '15:00',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Historia y contenido de la declaración más importante del siglo XX.',
            resources: [
              { id: 'r1', title: 'Declaración Universal completa (PDF)', type: 'pdf', url: '#' },
            ],
          },
          {
            id: 'l2',
            title: 'Sistemas regionales de protección',
            duration: '17:42',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Corte Interamericana, Tribunal Europeo y otros mecanismos regionales.',
            resources: [],
          },
        ],
      },
      {
        id: 'm2',
        title: 'Derechos en la Práctica',
        lessons: [
          {
            id: 'l3',
            title: 'Cómo denunciar una violación de DDHH',
            duration: '22:18',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Guía paso a paso para presentar denuncias ante organismos nacionales e internacionales.',
            resources: [
              { id: 'r2', title: 'Formulario de denuncia modelo', type: 'template', url: '#' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    slug: 'transparencia-anticorrupcion',
    title: 'Transparencia y Lucha Anticorrupción',
    subtitle: 'Herramientas ciudadanas para exigir cuentas y combatir la corrupción',
    category: 'Transparencia',
    level: 'Intermedio',
    duration: '5h 45min',
    badge: 'Destacado',
    thumbnail: '/images/course-transparency.jpg',
    description:
      'Aprende a utilizar los mecanismos de acceso a la información, auditoría ciudadana y denuncia de irregularidades. Un curso práctico orientado a resultados reales.',
    instructor: 'Lic. María Torres',
    rating: 4.7,
    students: 1850,
    aiGuideSlug: 'solicitud-informacion-publica',
    modules: [
      {
        id: 'm1',
        title: 'Acceso a la Información',
        lessons: [
          {
            id: 'l1',
            title: 'Derecho de acceso a la información pública',
            duration: '13:45',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Marco legal y procedimientos para solicitar información al gobierno.',
            resources: [
              { id: 'r1', title: 'Modelo de solicitud de información', type: 'template', url: '#' },
            ],
          },
          {
            id: 'l2',
            title: 'Análisis de presupuestos públicos',
            duration: '25:20',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Cómo leer, interpretar y auditar el presupuesto de tu municipio.',
            resources: [
              { id: 'r2', title: 'Guía de lectura presupuestaria', type: 'pdf', url: '#' },
            ],
          },
        ],
      },
      {
        id: 'm2',
        title: 'Auditoría Social',
        lessons: [
          {
            id: 'l3',
            title: 'Metodología de auditoría ciudadana',
            duration: '28:10',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Técnicas probadas para monitorear obras públicas y contratos.',
            resources: [],
          },
          {
            id: 'l4',
            title: 'Documentar y reportar irregularidades',
            duration: '20:05',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Aprende a construir un expediente sólido para presentar denuncias.',
            resources: [
              { id: 'r3', title: 'Plantilla de informe de irregularidades', type: 'template', url: '#' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '4',
    slug: 'gobernanza-digital-ia',
    title: 'Gobernanza Digital e Inteligencia Artificial',
    subtitle: 'Entiende cómo la IA impacta la toma de decisiones públicas',
    category: 'Gobernanza Digital',
    level: 'Avanzado',
    duration: '6h 20min',
    badge: 'Nuevo',
    thumbnail: '/images/course-ai-governance.jpg',
    description:
      'Curso avanzado sobre el uso de algoritmos en el sector público, sesgos en sistemas automatizados y marcos regulatorios emergentes. Diseñado para ciudadanos que quieren ser parte del debate sobre el futuro digital.',
    instructor: 'Dr. Javier Lozano',
    rating: 4.6,
    students: 1120,
    aiGuideSlug: 'evaluacion-algoritmos-publicos',
    modules: [
      {
        id: 'm1',
        title: 'IA en el Sector Público',
        lessons: [
          {
            id: 'l1',
            title: 'Algoritmos en la toma de decisiones gubernamentales',
            duration: '24:15',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Casos reales de uso de IA en beneficios sociales, seguridad y justicia.',
            resources: [
              { id: 'r1', title: 'Informe: IA en gobiernos latinoamericanos', type: 'pdf', url: '#' },
            ],
          },
          {
            id: 'l2',
            title: 'Sesgos algorítmicos y discriminación',
            duration: '19:48',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Cómo los sesgos en datos generan inequidad en sistemas automatizados.',
            resources: [],
          },
        ],
      },
      {
        id: 'm2',
        title: 'Regulación y Ciudadanía Digital',
        lessons: [
          {
            id: 'l3',
            title: 'Marcos regulatorios: EU AI Act y más allá',
            duration: '22:30',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Panorama global de regulaciones de IA y su impacto ciudadano.',
            resources: [
              { id: 'r2', title: 'Resumen EU AI Act', type: 'pdf', url: '#' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '5',
    slug: 'etica-publica-servidores',
    title: 'Ética Pública para Servidores y Ciudadanos',
    subtitle: 'Principios, dilemas y buenas prácticas en el ejercicio del poder',
    category: 'Ética Pública',
    level: 'Intermedio',
    duration: '4h 00min',
    badge: null,
    thumbnail: '/images/course-ethics.jpg',
    description:
      'Un viaje por los principios éticos que deben guiar la función pública. Casos de estudio, dilemas morales y herramientas para tomar decisiones íntegras en contextos de presión.',
    instructor: 'Prof. Sofía Herrera',
    rating: 4.5,
    students: 980,
    modules: [
      {
        id: 'm1',
        title: 'Fundamentos de Ética Pública',
        lessons: [
          {
            id: 'l1',
            title: 'Qué es la ética pública y por qué importa',
            duration: '11:30',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Introducción a los conceptos clave de integridad institucional.',
            resources: [],
          },
          {
            id: 'l2',
            title: 'Conflictos de interés: identificar y prevenir',
            duration: '16:44',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Casos prácticos para reconocer situaciones de conflicto de interés.',
            resources: [
              { id: 'r1', title: 'Guía de conflictos de interés', type: 'pdf', url: '#' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '6',
    slug: 'participacion-comunitaria',
    title: 'Participación Comunitaria y Organización',
    subtitle: 'Construye ciudadanía activa desde tu barrio y municipio',
    category: 'Participación Ciudadana',
    level: 'Principiante',
    duration: '3h 50min',
    badge: 'Popular',
    thumbnail: '/images/course-community.jpg',
    description:
      'Herramientas prácticas para organizarse, dialogar con autoridades locales y liderar proyectos comunitarios. Aprende técnicas de facilitación, negociación y comunicación ciudadana.',
    instructor: 'Lic. Roberto Campos',
    rating: 4.8,
    students: 2750,
    modules: [
      {
        id: 'm1',
        title: 'Organización Ciudadana',
        lessons: [
          {
            id: 'l1',
            title: 'Cómo formar un colectivo ciudadano',
            duration: '18:22',
            videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            description: 'Pasos para constituir un grupo organizado con objetivos claros.',
            resources: [
              { id: 'r1', title: 'Manual de organización comunitaria', type: 'pdf', url: '#' },
            ],
          },
        ],
      },
    ],
  },
]

// ============================================================
// AI GUIDES MOCK DATA
// TODO: Move to separate endpoint when CMS is integrated.
// ============================================================

export type GuideStep = {
  step: number
  title: string
  description: string
}

export interface AiGuide {
  id: string
  slug: string
  title: string
  objective: string
  category: string
  tool: string
  steps: GuideStep[]
  suggestedPrompt: string
  tools: string[]
  relatedCourseSlug?: string
}

export const aiGuides: AiGuide[] = [
  {
    id: 'g1',
    slug: 'analisis-fuentes-informacion',
    title: 'Analizar fuentes de información con IA',
    objective: 'Usar modelos de lenguaje para evaluar la credibilidad, sesgo y precisión de artículos y noticias.',
    category: 'Verificación',
    tool: 'ChatGPT / Claude',
    tools: ['ChatGPT', 'Claude', 'Perplexity AI'],
    relatedCourseSlug: 'democracia-digital',
    steps: [
      { step: 1, title: 'Identificar la fuente', description: 'Copia el texto o URL del artículo que deseas analizar.' },
      { step: 2, title: 'Contextualizar con la IA', description: 'Presenta el contenido al modelo explicando que quieres un análisis crítico de credibilidad.' },
      { step: 3, title: 'Solicitar evaluación de sesgo', description: 'Pide al modelo que identifique posibles sesgos ideológicos, políticos o comerciales.' },
      { step: 4, title: 'Verificar datos clave', description: 'Solicita que el modelo identifique afirmaciones verificables y sugiera fuentes para contrastarlas.' },
      { step: 5, title: 'Sintetizar conclusiones', description: 'Pide un resumen con un semáforo de credibilidad: alta, media o baja.' },
    ],
    suggestedPrompt: `Actúa como un analista de medios experimentado. Voy a compartirte el siguiente artículo/texto:

[PEGA EL TEXTO AQUÍ]

Por favor:
1. Evalúa la credibilidad de las afirmaciones principales (escala 1-10).
2. Identifica posibles sesgos (ideológico, político, comercial).
3. Señala qué datos deberían verificarse y con qué fuentes.
4. Dame un veredicto final: ¿es información confiable, dudosa o falsa?

Sé directo y específico en tu análisis.`,
  },
  {
    id: 'g2',
    slug: 'solicitud-informacion-publica',
    title: 'Redactar solicitudes de información pública',
    objective: 'Generar solicitudes formales, precisas y jurídicamente sólidas para organismos gubernamentales usando IA.',
    category: 'Transparencia',
    tool: 'ChatGPT / Claude',
    tools: ['ChatGPT', 'Claude', 'Gemini'],
    relatedCourseSlug: 'transparencia-anticorrupcion',
    steps: [
      { step: 1, title: 'Define tu objetivo', description: 'Clarifica exactamente qué información necesitas y para qué la usarás.' },
      { step: 2, title: 'Identifica el organismo', description: 'Determina cuál entidad gubernamental tiene la información que buscas.' },
      { step: 3, title: 'Prepara el prompt', description: 'Proporciona contexto legal y el marco de acceso a la información de tu país.' },
      { step: 4, title: 'Generar el borrador', description: 'Usa el prompt sugerido para que la IA redacte la solicitud formal.' },
      { step: 5, title: 'Revisar y personalizar', description: 'Ajusta el documento generado con tus datos personales y detalles específicos.' },
    ],
    suggestedPrompt: `Eres un abogado especialista en derecho de acceso a la información pública en [TU PAÍS].

Necesito redactar una solicitud formal dirigida a [NOMBRE DEL ORGANISMO] solicitando:
[DESCRIBE LA INFORMACIÓN QUE NECESITAS]

La solicitud debe:
- Citar el artículo legal que ampara mi derecho (Ley de Transparencia o equivalente)
- Ser específica y delimitar claramente el período de tiempo
- Solicitar formato accesible (datos abiertos si aplica)
- Incluir mis datos de contacto como [NOMBRE, EMAIL]
- Tener un tono formal pero ciudadano

Redacta la solicitud completa lista para enviar.`,
  },
  {
    id: 'g3',
    slug: 'evaluacion-algoritmos-publicos',
    title: 'Evaluar el impacto de algoritmos en políticas públicas',
    objective: 'Usar IA para analizar cómo los sistemas automatizados afectan decisiones gubernamentales y detectar posibles sesgos.',
    category: 'Gobernanza Digital',
    tool: 'Claude / ChatGPT',
    tools: ['Claude', 'ChatGPT', 'Gemini Advanced'],
    relatedCourseSlug: 'gobernanza-digital-ia',
    steps: [
      { step: 1, title: 'Obtén documentación del sistema', description: 'Busca información pública sobre el algoritmo: auditorías, informes, datos de entrenamiento.' },
      { step: 2, title: 'Identifica las decisiones afectadas', description: 'Determina qué tipo de decisiones toma o apoya el algoritmo (beneficios, penas, créditos).' },
      { step: 3, title: 'Analiza grupos impactados', description: 'Solicita a la IA que identifique grupos demográficos que pueden ser más afectados.' },
      { step: 4, title: 'Busca indicadores de sesgo', description: 'Usa la IA para interpretar métricas de equidad si tienes acceso a los datos.' },
      { step: 5, title: 'Genera recomendaciones', description: 'Pide sugerencias concretas para auditorías ciudadanas o modificaciones al sistema.' },
    ],
    suggestedPrompt: `Eres un experto en ética de la inteligencia artificial y políticas públicas.

Te voy a describir un sistema algorítmico utilizado por el gobierno:
[DESCRIBE EL SISTEMA: qué hace, qué datos usa, qué decisiones apoya]

Por favor:
1. Identifica los 3 principales riesgos de sesgos o discriminación.
2. ¿Qué grupos poblacionales son más vulnerables a efectos negativos?
3. ¿Qué información debería ser pública para auditar este sistema?
4. Sugiere 5 preguntas clave que los ciudadanos deberían hacerle al gobierno sobre este algoritmo.
5. ¿Qué marcos regulatorios (nacionales o internacionales) aplican?`,
  },
  {
    id: 'g4',
    slug: 'resumen-legislativo-ia',
    title: 'Resumir y analizar proyectos de ley con IA',
    objective: 'Comprender rápidamente el contenido y las implicaciones de legislación compleja usando modelos de lenguaje.',
    category: 'Democracia',
    tool: 'Claude / ChatGPT',
    tools: ['Claude', 'ChatGPT', 'Gemini'],
    steps: [
      { step: 1, title: 'Obtén el texto del proyecto', description: 'Descarga el PDF o copia el texto del proyecto de ley desde el sitio oficial del parlamento.' },
      { step: 2, title: 'Fragmenta si es necesario', description: 'Si el texto es largo, divídelo en secciones y analiza cada una por separado.' },
      { step: 3, title: 'Solicita resumen ejecutivo', description: 'Pide un resumen en lenguaje ciudadano de los puntos principales.' },
      { step: 4, title: 'Identifica actores y beneficiados', description: 'Pregunta quién se beneficia, quién puede verse perjudicado y qué intereses están en juego.' },
      { step: 5, title: 'Genera preguntas para debate', description: 'Crea una lista de preguntas críticas para hacerle al legislador o en foros públicos.' },
    ],
    suggestedPrompt: `Actúa como un analista parlamentario con experiencia en comunicación ciudadana.

Aquí está el texto del proyecto de ley [NOMBRE/NÚMERO]:

[PEGA EL TEXTO O LOS ARTÍCULOS PRINCIPALES]

Por favor proporciona:
1. RESUMEN EN 5 PUNTOS: Las medidas más importantes en lenguaje simple.
2. QUIÉN SE BENEFICIA: Sectores, grupos o actores que ganan con esta ley.
3. POSIBLES IMPACTOS NEGATIVOS: Qué grupos podrían verse afectados negativamente.
4. CONTROVERSIAS ANTICIPADAS: Puntos que probablemente generen debate público.
5. PREGUNTAS CIUDADANAS: 5 preguntas clave para exigirle transparencia al gobierno sobre esta ley.`,
  },
  {
    id: 'g5',
    slug: 'mapeo-actores-locales',
    title: 'Mapear actores y poder en tu comunidad',
    objective: 'Usar IA para estructurar un análisis de actores locales, identificar aliados y trazar estrategias de incidencia.',
    category: 'Participación Ciudadana',
    tool: 'ChatGPT / Claude',
    tools: ['ChatGPT', 'Claude'],
    steps: [
      { step: 1, title: 'Lista los actores relevantes', description: 'Identifica organizaciones, líderes, instituciones y empresas que influyen en el tema.' },
      { step: 2, title: 'Clasifica por posición', description: 'Determina si cada actor está a favor, en contra o neutral respecto a tu objetivo.' },
      { step: 3, title: 'Analiza recursos e influencia', description: 'Evalúa el poder, los recursos y las redes de cada actor.' },
      { step: 4, title: 'Identifica oportunidades de alianza', description: 'Busca actores con intereses alineados que puedan sumarse a tu causa.' },
      { step: 5, title: 'Diseña estrategia de incidencia', description: 'Crea un plan de aproximación a actores clave.' },
    ],
    suggestedPrompt: `Eres un experto en análisis político y estrategia de incidencia ciudadana.

Mi objetivo ciudadano es: [DESCRIBE TU OBJETIVO, ej: "mejorar el alumbrado público en mi barrio" o "aprobar ordenanza ambiental"]

Los actores que he identificado son:
[LISTA DE ACTORES CON BREVE DESCRIPCIÓN]

Por favor:
1. Clasifica cada actor en una matriz: (A favor / En contra / Neutral) x (Alto poder / Bajo poder).
2. Identifica los 3 actores más importantes para mi estrategia y por qué.
3. Sugiere cómo acercarme a cada actor clave (mensajes, canales, intereses).
4. Señala los principales obstáculos que debo anticipar.
5. Propón un plan de acción de 30 días para avanzar mi objetivo.`,
  },
]
