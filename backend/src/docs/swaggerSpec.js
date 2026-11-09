export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'NexusTech Campus Marketplace API',
    version: '3.0.0',
    description: 'API RESTful para el Marketplace universitario NexusTech (Hito 3: PostgreSQL + MongoDB + Swagger UI). Integra autenticación de usuarios por roles (comprador/vendedor), CRUD de productos, órdenes de compra y seguimiento de estados, pasarela de pago simulada Webpay Plus, e historial de telemetría/interacciones en MongoDB.',
    contact: {
      name: 'Equipo NexusTech UNAB',
      email: 'contacto@nexustech-unab.cl'
    }
  },
  servers: [
    { url: 'http://localhost:4000', description: 'Servidor Local de Desarrollo' }
  ],
  tags: [
    { name: 'Auth & Usuarios', description: 'Registro, inicio de sesión y perfiles de comprador/vendedor' },
    { name: 'Productos', description: 'Catálogo, búsqueda, filtros, paginación y CRUD de artículos' },
    { name: 'Pedidos & Rastreo', description: 'Creación de órdenes y ciclo de vida de seguimiento' },
    { name: 'Transacciones', description: 'Simulación de pagos con Webpay Plus y comprobantes' },
    { name: 'Interacciones MongoDB', description: 'Telemetría de eventos de usuario e historial no relacional' },
    { name: 'Tipo de Cambio', description: 'Integración con API pública Mindicador.cl (CLP a USD)' }
  ],
  paths: {
    '/api/v1/auth/register': {
      post: {
        tags: ['Auth & Usuarios'],
        summary: 'Registrar un nuevo usuario',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'email', 'password'],
                properties: {
                  nombre: { type: 'string', example: 'Martina Morales' },
                  email: { type: 'string', example: 'martina.morales@uandresbello.edu' },
                  password: { type: 'string', example: 'secreto123' },
                  rol: { type: 'string', enum: ['comprador', 'vendedor', 'ambos'], example: 'comprador' },
                  telefono: { type: 'string', example: '+56 9 8888 7777' },
                  campus: { type: 'string', example: 'Campus Casona UNAB' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Usuario creado exitosamente' },
          400: { description: 'Datos de entrada inválidos' },
          409: { description: 'El correo electrónico ya existe' }
        }
      }
    },
    '/api/v1/auth/login': {
      post: {
        tags: ['Auth & Usuarios'],
        summary: 'Iniciar sesión',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'estudiante@uandresbello.edu' },
                  password: { type: 'string', example: 'demo1234' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Autenticación exitosa con token simulado' },
          401: { description: 'Credenciales inválidas' }
        }
      }
    },
    '/api/v1/auth/me': {
      get: {
        tags: ['Auth & Usuarios'],
        summary: 'Obtener perfil del usuario autenticado',
        parameters: [
          { in: 'header', name: 'x-user-id', schema: { type: 'string' }, description: 'ID de usuario para la sesión' }
        ],
        responses: {
          200: { description: 'Datos del usuario y estadísticas de pedidos/ventas' }
        }
      }
    },
    '/api/v1/auth/switch-role': {
      post: {
        tags: ['Auth & Usuarios'],
        summary: 'Alternar rol del usuario (comprador/vendedor)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId'],
                properties: {
                  userId: { type: 'string', example: 'usr-demo' },
                  targetRole: { type: 'string', enum: ['comprador', 'vendedor', 'ambos'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Rol actualizado y registrado en MongoDB audit_logs' }
        }
      }
    },
    '/api/v1/products': {
      get: {
        tags: ['Productos'],
        summary: 'Listar productos con filtros, búsqueda y paginación',
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 24 } },
          { in: 'query', name: 'search', schema: { type: 'string' } },
          { in: 'query', name: 'categoria', schema: { type: 'string', enum: ['Workstations', 'Hardware', 'Periféricos', 'Soluciones'] } },
          { in: 'query', name: 'minPrice', schema: { type: 'integer' } },
          { in: 'query', name: 'maxPrice', schema: { type: 'integer' } },
          { in: 'query', name: 'sortBy', schema: { type: 'string', enum: ['newest', 'price_asc', 'price_desc'] } }
        ],
        responses: {
          200: { description: 'Listado paginado de productos' }
        }
      },
      post: {
        tags: ['Productos'],
        summary: 'Publicar un nuevo producto',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'categoria', 'precio', 'descripcion'],
                properties: {
                  nombre: { type: 'string', example: 'Kit Memoria Corsair Dominator 32GB DDR5' },
                  categoria: { type: 'string', example: 'Hardware' },
                  precio: { type: 'integer', example: 145000 },
                  imagen: { type: 'string', example: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80' },
                  descripcion: { type: 'string', example: 'Memorias optimizadas para overclocking y renderizado.' },
                  stock: { type: 'integer', example: 2 },
                  condicion: { type: 'string', example: 'Como nuevo' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Producto creado y registrado en base de datos relacional' },
          400: { description: 'Validación de campos fallida' }
        }
      }
    },
    '/api/v1/products/{id}': {
      get: {
        tags: ['Productos'],
        summary: 'Consultar ficha de producto por ID',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Ficha del producto (registra VIEW_PRODUCT en MongoDB)' },
          404: { description: 'Producto no encontrado' }
        }
      },
      put: {
        tags: ['Productos'],
        summary: 'Actualizar un producto existente',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  categoria: { type: 'string' },
                  precio: { type: 'integer' },
                  descripcion: { type: 'string' },
                  stock: { type: 'integer' },
                  condicion: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Producto modificado exitosamente' },
          404: { description: 'Producto no encontrado' }
        }
      },
      delete: {
        tags: ['Productos'],
        summary: 'Eliminar un producto (soft-delete)',
        parameters: [
          { in: 'path', name: 'id', required: true, schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Producto retirado del catálogo' },
          404: { description: 'Producto no encontrado' }
        }
      }
    },
    '/api/v1/orders': {
      post: {
        tags: ['Pedidos & Rastreo'],
        summary: 'Crear un pedido a partir del carrito de compras',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nombre', 'email', 'direccion', 'ciudad', 'items'],
                properties: {
                  nombre: { type: 'string', example: 'Martina Morales' },
                  email: { type: 'string', example: 'martina@uandresbello.edu' },
                  direccion: { type: 'string', example: 'Av. Las Condes 12345' },
                  ciudad: { type: 'string', example: 'Santiago' },
                  metodo_pago: { type: 'string', example: 'Webpay Plus Simulado' },
                  items: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        nombre: { type: 'string' },
                        precio: { type: 'integer' },
                        cantidad: { type: 'integer' },
                        acabado: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Pedido creado con código TRK-XXXXXX' },
          400: { description: 'Campos faltantes o carrito vacío' }
        }
      },
      get: {
        tags: ['Pedidos & Rastreo'],
        summary: 'Listar pedidos',
        parameters: [
          { in: 'query', name: 'buyerId', schema: { type: 'string' } },
          { in: 'query', name: 'email', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Historial de pedidos' }
        }
      }
    },
    '/api/v1/orders/{codigo}': {
      get: {
        tags: ['Pedidos & Rastreo'],
        summary: 'Consultar seguimiento de un pedido por código TRK',
        parameters: [
          { in: 'path', name: 'codigo', required: true, schema: { type: 'string', example: 'TRK-987654' } }
        ],
        responses: {
          200: { description: 'Detalle del pedido y línea de tiempo con pasos' },
          404: { description: 'Código de pedido no encontrado' }
        }
      }
    },
    '/api/v1/orders/{codigo}/status': {
      patch: {
        tags: ['Pedidos & Rastreo'],
        summary: 'Avanzar o actualizar estado de un pedido',
        parameters: [
          { in: 'path', name: 'codigo', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  paso: { type: 'integer', minimum: 0, maximum: 3, example: 2 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Estado actualizado y registrado en auditoría MongoDB' }
        }
      }
    },
    '/api/v1/transactions/simulate': {
      post: {
        tags: ['Transacciones'],
        summary: 'Simular procesamiento de pago electrónico (Webpay Plus)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['monto'],
                properties: {
                  monto: { type: 'integer', example: 145000 },
                  metodo: { type: 'string', example: 'Webpay Plus' },
                  orderCodigo: { type: 'string', example: 'TRK-987654' },
                  cardNumber: { type: 'string', example: '4242424242424242' },
                  simulatedOutcome: { type: 'string', enum: ['SUCCESS', 'FAILURE'], example: 'SUCCESS' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Pago autorizado con comprobante oficial y código de autorización' },
          402: { description: 'Pago rechazado (tarjeta denegada / fondos insuficientes)' }
        }
      }
    },
    '/api/v1/interactions': {
      post: {
        tags: ['Interacciones MongoDB'],
        summary: 'Registrar un evento de interacción del usuario en MongoDB',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['eventType'],
                properties: {
                  eventType: { type: 'string', example: 'ADD_TO_CART' },
                  userId: { type: 'string', example: 'usr-demo' },
                  productId: { type: 'string', example: 'prod-001' },
                  productName: { type: 'string', example: 'Workstation Dell Precision' },
                  metadata: { type: 'object' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Documento insertado en colección MongoDB interactions' }
        }
      },
      get: {
        tags: ['Interacciones MongoDB'],
        summary: 'Consultar historial de telemetría e interacciones',
        parameters: [
          { in: 'query', name: 'eventType', schema: { type: 'string' } },
          { in: 'query', name: 'userId', schema: { type: 'string' } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 50 } }
        ],
        responses: {
          200: { description: 'Documentos BSON ordenados descendentemente por fecha' }
        }
      }
    },
    '/api/v1/interactions/analytics': {
      get: {
        tags: ['Interacciones MongoDB'],
        summary: 'Obtener agregación analítica de eventos en MongoDB',
        responses: {
          200: { description: 'Métricas de eventos por categoría y actividad reciente' }
        }
      }
    },
    '/api/v1/exchange/usd': {
      get: {
        tags: ['Tipo de Cambio'],
        summary: 'Obtener tipo de cambio USD/CLP oficial desde Mindicador.cl',
        responses: {
          200: { description: 'Valor del dólar observado con fecha y origen' }
        }
      }
    }
  }
};
