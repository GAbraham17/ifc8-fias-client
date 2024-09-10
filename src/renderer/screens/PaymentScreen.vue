<template>
  <v-container class="pt-4 pa-12">
    <form @submit.prevent="submit">
      <v-row no-gutters align="center" class="text-center mt-4">
        <v-col cols="12">
          <v-theme-provider with-background>
            <v-card class="pt-2" subtitle="Mar 13 Agosto 2024" title="MOON PALACE CANCUN ">
              <v-card-text>
                <div>Monto a Pagar</div>

                <p class="text-h4 font-weight-black mb-4">$ {{ finalAmount }}
                  {{ currency }}
                  <v-speed-dial location="bottom left" transition="fade-transition">
                    <template #activator="{ props: activatorProps }">
                      <v-fab style="margin-top: -8px" v-bind="activatorProps" size="large"
                        icon="mdi-filter-settings"></v-fab>
                    </template>
                    <v-btn :key="1" class="mt-7 ml-2" icon="$success" @click="currency = 'USD'">USD</v-btn>
                    <v-btn :key="2" class="ml-2" icon="$info" @click="currency = 'MXN'">MXN</v-btn>
                  </v-speed-dial>
                </p>
                <p>Reservación: {{ confirmationNumber }}</p>
                <p>Huesped: {{ guest }}</p>

                <v-divider class="mt-4 mb-4"></v-divider>

                <v-row v-if="currency === 'MXN'">
                  <v-col cols="6">
                    <v-text-field :readonly="isEditable" v-model="exchange.value.value" v-maska="{
                      mask: '##.00',
                      tokens: {
                        '0': {
                          pattern: /[0-9]/,
                          optional: true
                        }
                      }
                    }" :error-messages="exchange.errorMessage.value" label="Tipo de Cambio"
                      prepend-inner-icon="mdi-currency-usd" variant="underlined"></v-text-field>
                  </v-col>
                  <v-col cols="6">
                    <v-select v-model="exchangeType.value.value" :error-messages="exchangeType.errorMessage.value"
                      :items="exchangeTypes.map((i) => i.code)" label="Origen" variant="underlined"></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="6" class="text-left">
                    <v-menu>
                      <template #activator="{ props }">
                        <v-btn color="#274C68" v-bind="props">
                          <img height="25" class="mr-2" width="25" src="/images/terminal-2.svg" />
                          {{ terminal }}
                        </v-btn>
                      </template>
                      <v-list density="compact">
                        <v-list-item v-for="terminal in terminals" :key="terminal.code" :value="terminal.code"
                          @click="changeTerminal(terminal)">
                          <template #prepend>
                            <img height="20" class="mr-3" src="/images/terminal-2-dark.svg" />
                          </template>
                          <v-list-item-title class="text-subtitle-2">{{
                            terminal.code
                          }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </v-col>
                  <v-col cols="6" class="text-right">
                    <v-btn color="error" class="mr-4" @click="reset"> Cancelar </v-btn>
                    <v-btn color="#274C68" type="submit"> Continuar</v-btn>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-theme-provider>
        </v-col>
        <v-col cols="12" class="mt-6">
          <div class="text-medium-emphasis">
            relating to or dependent on charity; charitable; charitable donations. Pertaining to
            alms.<br />
            "an eleemosynary educational institution."
          </div>
        </v-col>
      </v-row>
    </form>
  </v-container>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useField, useForm } from 'vee-validate'
import { vMaska } from 'maska/vue'
import { storeToRefs } from 'pinia'
import { useSettingStore } from '@/renderer/store/setting'
import { useCatalogStore } from '@/renderer/store/catalog'
import { useRouter } from 'vue-router'
const { appSettings } = storeToRefs(useSettingStore())
const { loadTerminalByLocation, loadLocationsByHotel, loadCatalogs } = useCatalogStore()
const { terminals } = storeToRefs(useCatalogStore())
const { loadSettings } = useSettingStore()
const router = useRouter()
// const route = useRoute()


onMounted(async () => {
  await loadSettings()
  await loadCatalogs()
  terminal.value = appSettings.value.terminal
  loadLocationsByHotel(appSettings.value.workstation.property.code)
  loadTerminalByLocation(appSettings.value.location)
})

const currency = ref('USD')
const terminal = ref('')
const amount = ref('')
const confirmationNumber = ref('')
const guest = ref('')
const transactionId = ref('');

const exchangeTypes = ref([])

const changeTerminal = (value) => {
  terminal.value = value.code
}

const { handleSubmit } = useForm({
  initialValues: {
    exchange: 1,
    exchangeType: null
  },
  validationSchema: {
    exchange(value) {
      const exchangeRegex = /^\d{1,2}(\.\d{1,2})?$/
      if (exchangeRegex.test(value) && value > 0) return true

      return 'Must be a valid exchange value greater than zero'
    },
    exchangeType(value) {
      if (value) return true

      return 'Select an item.'
    }
  }
})

const exchange = useField('exchange')
const exchangeType = useField('exchangeType')
const isEditable = ref(false);

const finalAmount = computed(() => {
  return amount.value * ((currency.value === 'USD') ? 1 : (exchange.value.value || 1))
})

watch(exchangeType.value, (exchangeTypeItem) => {
  isEditable.value = exchangeTypeItem !== 'Fijo'
  const selectedExchangeItem = exchangeTypes.value.find((item) => item.code === exchangeTypeItem)
  exchange.value.value = selectedExchangeItem.value
})

const submit = handleSubmit((values) => {
  console.log({
    ...values,
    terminal: terminal.value,
    currency: currency.value
  })
  window.mainApi.invoke('sendPaymentResponse', {
    transactionId: transactionId.value,
    terminal: terminal.value,
    currency: currency.value,
    amount: amount.value,
    exchangeRate: exchange.value.value,
    exchangeType: exchangeType.value.value
  })
})

window.mainApi.onPaymentRequest((data) => {
  console.log('Payment request: ', JSON.stringify(data))

  exchangeTypes.value = [
    {
      value: data.dailyExchangeRate,
      code: 'Diario'
    }
  ];

  if (data.currency === 'MXN') {
    exchangeTypes.value.push({
      value: data.reservation.exchangeRate,
      code: 'Reserva'
    })
  }

  exchangeTypes.value.push({
    value: data.dailyExchangeRate,
    code: 'Fijo'
  })

  exchangeType.value.value = 'Diario';

  amount.value = data.amount
  currency.value = 'USD'
  confirmationNumber.value = data.reservation.confirmationNumber
  guest.value = data.reservation.guest
  exchange.value.value = data.dailyExchangeRate
  transactionId.value = data.transactionId
})

window.mainApi.onPaymentConfirmation((data) => {
  console.log('Payment confirmation: ', JSON.stringify(data))
  router.push({
    name: 'confirmation'
    /* params: {
      transactionId: data.transactionId
    } */
  })
  setTimeout(() => {
    window.close();
  }, 5000)
})

const reset = () => {
  router.push({
    name: 'confirmation'
    /* params: {
      transactionId: data.transactionId
    } */
  })
  setTimeout(() => {
    window.close();
  }, 5000)
}
</script>
<style>
.touppercase input {
  text-transform: uppercase;
}

.black-svg {
  fill: black;
}
</style>
