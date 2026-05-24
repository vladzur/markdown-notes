import { createApp, createRouter, defineEventHandler, toNodeListener } from 'h3'
import { createServer } from 'node:http'

const app = createApp()
const router = createRouter()

router.post(
  '/api/export',
  defineEventHandler(async (event) => {
    // TODO: recibir userId y lista de noteIds, generar ZIP con contenido Markdown
    return { status: 'not_implemented', message: 'Export endpoint placeholder' }
  }),
)

router.post(
  '/api/share',
  defineEventHandler(async (event) => {
    // TODO: generar link compartido temporal con expiración
    return { status: 'not_implemented', message: 'Share endpoint placeholder' }
  }),
)

app.use(router)

const port = process.env.PORT || '8080'
createServer(toNodeListener(app)).listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`)
})
