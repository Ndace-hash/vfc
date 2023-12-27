// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  app:{
    head:{
      link:[
        {href: '/valiant.png', rel:'icon'}
      ],
      title:"Valiant FC"
    }
  }
})
