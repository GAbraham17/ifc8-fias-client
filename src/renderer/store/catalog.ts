import axios from 'axios';
import { defineStore } from 'pinia'

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    items: [],
    terminals: [],
    hotels: [],
    locations: []
  }),
  getters: {
    getItems: (state): any => state.items,
    getTerminals: (state): any => state.terminals,
    getHotels: (state): any => state.hotels, // Update the type to boolean
    getLocations: (state): any => state.locations
  },
  actions: {
    async loadCatalogs() {
      const { data } = await axios.get('https://6tv7icixy5.execute-api.us-east-1.amazonaws.com/dev/hotel');
      this.items = data.data?.items;
      this.hotels = data.data?.items.map((item: any) => ({
        code: item.code,
        description: item.description,
      })).filter((item: any) => item.code !== 'ALL');
    },
    loadTerminalByLocation(location: string) {
      this.terminals = this.locations.find((locations: any) => locations.code === location)?.terminals?.map((terminal: any) => ({
        code: terminal.code,
        description: terminal.description,
      }));

      console.log('hotelCode:', location);

    },
    loadLocationsByHotel(hotelCode: string) {
      this.locations = this.items.find((item: any) => item.code === hotelCode)?.locations.map((location: any) => ({
        code: location.code,
        description: location.description,
        terminals: location.terminals,
      }));

      console.log('hotelCode:', JSON.stringify(this.locations));

    }
  }
})
