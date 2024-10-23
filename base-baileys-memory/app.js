const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');

const MongoAdapter = require('@bot-whatsapp/database/mongo');
const MONGO_DB_URI = 'mongodb+srv://achia:RZtHM20eIsJ86rgf@cluster0.96zbd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const MONGO_DB_NAME = 'Cluster0';

const downloadQuote = addKeyword(EVENTS.ACTION)
  .addAnswer(['Por favor escribe tu numero de pago'], {
    capture: true,
    delay: 2000
  })
  .addAction(async (ctx, { gotoFlow, state, flowDynamic }) => {
    const userAnswer = ctx.body;
    await flowDynamic(`Cargando documento para enviar`, {});
    await flowDynamic('Este mensaje envia una imagen', {
      media: 'https://drive.google.com/uc?export=download&id=1Rm8rMDcxx34xy9vI5D9T-Cp0FBhPRXA1'
    });
  });

const flowQuote = addKeyword(EVENTS.ACTION)
  .addAnswer(['📄 Aquí tienes nuestras 3 plantillas', 'Plantilla 1 ....', 'Plantilla 2 ...', 'Plantilla 3 ...'], null, null, [])
  .addAnswer(['Descripción plantilla 1 ....'], null, null, [])
  .addAnswer(['Descripción plantilla 2 ....'], null, null, [])
  .addAnswer(['Descripción plantilla 3 ....'], null, null, [])
  .addAnswer(['En cual de nuestras plantillas estas interesado', '👉 *1* Plantilla 1', '👉 *2* Plantilla 2', '👉 *3* Plantilla 3'], {
    capture: true,
    delay: 2000
  })
  .addAction(async (ctx, { gotoFlow, state, flowDynamic }) => {
    const userAnswer = ctx.body;

    if (userAnswer === '1' || userAnswer === '2' || userAnswer === '2') {
      await flowDynamic(`Realiza tu pago en: ......`, {});
      return;
    }

    await flowDynamic(`Error Opción incorrecta`, {});
    return gotoFlow(flowQuote);
  });

const flowCustomerService = addKeyword(EVENTS.ACTION).addAnswer(['🙌 Una persona se comunicara pronto contigo'], null, null, []);

const flowPrincipal = addKeyword(['hola', 'ole', 'alo'])
  .addAction(async (ctx, { gotoFlow, state, flowDynamic }) => {
    const nameFrom = ctx.pushName;
    await state.update({ name: nameFrom });
    await flowDynamic(
      `Hola ${nameFrom}, Bienvenido a Dc Global Consulting, para continuar selecciona alguna de las siguientes opciones:`,
      {}
    );
  })
  .addAction(async (ctx, { state, gotoFlow }) => {
    return gotoFlow(flowMenu);
  });

const flowMenu = addKeyword(EVENTS.ACTION)
  .addAnswer(['👉 *1* Cotizar plantillas', '👉 *2* Descargar plantilla pagada', '👉 *3* Servicio al cliente'], {
    capture: true,
    delay: 1000
  })
  .addAction(async (ctx, { state, gotoFlow }) => {
    const userAnswer = ctx.body;
    if (userAnswer === '1') {
      return gotoFlow(flowQuote);
    }
    if (userAnswer === '2') {
      return gotoFlow(downloadQuote);
    }
    if (userAnswer === '3') {
      return gotoFlow(flowCustomerService);
    }

    return gotoFlow(flowDefault);
  });

const flowDefault = addKeyword(EVENTS.ACTION).addAnswer("We don't have that Option 🤔");

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal, downloadQuote, flowDefault, flowCustomerService, flowQuote, flowMenu]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB
  });

  QRPortalWeb();

  /* MONGO CONNECTION
    const adapterDB = new MongoAdapter({
        dbUri: MONGO_DB_URI,
        dbName: MONGO_DB_NAME,
    })
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)
    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })
    QRPortalWeb()
*/
};

main();
