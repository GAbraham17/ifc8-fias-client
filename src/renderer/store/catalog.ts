import { defineStore } from 'pinia'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    terminals: [
      {
        code: 'V400m-451482337',
      },
      {
        code: 'V400m-451482192'
      }
    ],
    hotels: [
      {
        code: 'ZHBP',
        description: 'Beach Palace',
      },
      {
        code: 'ZHSP',
        description: 'Sun Palace',
      },
      {
        code: 'ZMSU',
        description: 'Moon Palace Sunrise',
      },
      {
        code: 'ZMGR',
        description: 'At Moon Palace The Grant ',
      }
    ]
  }),
  getters: {
    getTerminals: (state): any => state.terminals,
    getHotels: (state): any => state.hotels // Update the type to boolean
  },
  actions: {

  }
})
