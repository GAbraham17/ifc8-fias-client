<template>
  <div>
    <v-overlay :model-value="isTransactionStarted" persistent class="align-center justify-center">
      <v-progress-circular color="primary" size="64" indeterminate></v-progress-circular>
    </v-overlay>
    <v-dialog v-model="dialog" max-width="340" persistent>
      <v-list class="py-2" color="primary" elevation="12" rounded="lg">
        <v-list-item prepend-icon="$vuetify-outline" title="Tiempo de espera agotado">
          <template v-slot:prepend>
            <div class="pe-4">
              <v-icon color="primary" size="60">mdi-alert</v-icon>
            </div>
          </template>
          <v-list-subheader>Cerrando Ventana en...{{ countdownClose }}</v-list-subheader>
          <template v-slot:append>
            <v-progress-circular color="primary" indeterminate="disable-shrink" size="22"
              width="2"></v-progress-circular>
          </template>
        </v-list-item>
      </v-list>
    </v-dialog>
    <v-dialog v-model="dialogClose" max-width="340" persistent>
      <v-list class="py-2" color="primary" elevation="12" rounded="lg">
        <v-list-item prepend-icon="$vuetify-outline" title="Transacción cancelada">
          <template v-slot:prepend>
            <div class="pe-4">
              <v-icon color="primary" size="60">mdi-alert</v-icon>
            </div>
          </template>
          <div>La transacción no se puede completar</div>
          <v-list-subheader>Cerrando Ventana en...{{ countdownClose }}</v-list-subheader>
          <template v-slot:append>
            <v-progress-circular color="primary" indeterminate="disable-shrink" size="22"
              width="2"></v-progress-circular>
          </template>
        </v-list-item>
      </v-list>
    </v-dialog>
    <v-container class="pt-4 pa-12">
      <form @submit.prevent="submit">
        <v-row no-gutters align="center" class="text-center mt-4">
          <v-col cols="12">
            <v-theme-provider with-background>
              <v-card class="pt-2" :subtitle="transactionDate" :title="hotel.name">
                <v-card-text>
                  <div>Monto a Pagar</div>
                  <v-row>
                    <v-col class="text-center mb-0 pb-0" cols="12">
                      <p class="text-h4 font-weight-black">$ {{ finalAmount }}</p>
                    </v-col>
                    <v-col class="d-flex text-center mt-0 pt-0" cols="12">
                      <v-chip-group v-model="currency" mandatory style="margin: auto;">
                        <v-chip text="USD" value="USD" variant="outlined" label filter></v-chip>
                        <v-chip text="MXN" value="MXN" variant="outlined" label filter></v-chip>
                      </v-chip-group>
                    </v-col>
                  </v-row>


                  <p>Reservación: {{ confirmationNumber }}</p>
                  <p>Huesped: {{ guest }}</p>

                  <v-divider class="mt-4 mb-4"></v-divider>
                  <v-row v-if="currency === 'MXN'">
                    <v-col class="pb-0 mb-0">
                      Tipo de Cambio:
                    </v-col>
                    <v-col class="d-flex text-center mt-0 pt-0" cols="12">
                      <v-chip-group v-model="exchangeType" mandatory style="margin: auto;">
                        <v-chip v-for="type in exchangeTypes.filter((t) => t.code !== 'Fijo')" :value="type.code"
                          :key="type.code" variant="outlined" @click="setExchange(type.value)" label filter>
                          <span class="pr-1">{{ type.code }}: </span><b>${{ type.value }}</b>
                        </v-chip>
                        <v-chip value="Fijo" variant="outlined" @click="setFixedExchange" label filter>
                          <span class="pr-1">Fijo: </span>
                          <v-text-field width="100" density="compact" variant="solo" hide-details single-line
                            :readonly="isEditable" v-model="fixedExchange.value.value" v-maska="{
                              mask: '##.00',
                              tokens: {
                                '0': {
                                  pattern: /[0-9]/,
                                  optional: true
                                }
                              }
                            }" @change="setFixedExchange" :error-messages="fixedExchange.errorMessage.value" label="$"
                            prefix="$"></v-text-field>
                        </v-chip>
                      </v-chip-group>
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
                      <v-btn :disabled="isTransactionStarted" color="error" class="mr-4" @click="reset"> Cancelar
                      </v-btn>
                      <v-btn :disabled="disabledTransaction || isTransactionStarted" color="#274C68" type="submit">
                        Continuar</v-btn>
                    </v-col>
                  </v-row>
                  <v-row v-if="!isTransactionStarted">
                    <v-col cols="12" class="mt-6">
                      <div class="text-medium-emphasis">
                        Tiempo restante: {{ countdown }} segundos
                      </div>
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
  </div>
</template>
<script setup>
import { computed, ref, watch } from 'vue'
import { useField, useForm } from 'vee-validate'
import { vMaska } from 'maska/vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/es'

const terminals = ref([])
const hotel = ref({})
const router = useRouter()
// const route = useRoute()

const currency = ref('USD')
const terminal = ref('')
const amount = ref('')
const confirmationNumber = ref('')
const guest = ref('')
const transactionId = ref('');
const countdown = ref(70)
const countdownClose = ref(5)
const disabledTransaction = ref(false);
const isTransactionStarted = ref(false)
const dialog = ref(false)
const dialogClose = ref(false)
const exchangeType = ref('Diario');
const exchange = ref(1)

dayjs.locale('es')
dayjs.extend(localizedFormat);
const transactionDate = dayjs().format('LLLL A');

let interval = null;

const exchangeTypes = ref([])

const changeTerminal = (value) => {
  terminal.value = value.code
}

const { handleSubmit } = useForm({
  initialValues: {
    fixedExchange: 1
  },
  validationSchema: {
    fixedExchange(value) {
      const exchangeRegex = /^\d{1,2}(\.\d{1,2})?$/
      if (exchangeRegex.test(value) && value > 0) return true

      return 'Must be a valid exchange value greater than zero'
    }
  }
})

const fixedExchange = useField('fixedExchange')
const isEditable = ref(false);

const finalAmount = computed(() => {
  return (amount.value * ((currency.value === 'USD') ? 1 : (exchange.value || 1))).toFixed(2)
})

watch(exchangeType, (exchangeTypeItem) => {
  console.log(exchangeTypeItem);
  if (exchangeTypeItem === 'Fijo')
    setFixedExchange()
  else {
    const selectedExchangeItem = exchangeTypes.value.find((item) => item.code === exchangeTypeItem)
    if (selectedExchangeItem) {
      setExchange(selectedExchangeItem.value)
    }
  }
})

const submit = handleSubmit((values) => {
  clearInterval(interval)
  isTransactionStarted.value = true;
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
    exchangeRate: exchange.value,
    exchangeType: exchangeType.value.value
  })
})

const setExchange = (value) => {
  exchange.value = value
}

const setFixedExchange = () => {
  exchange.value = fixedExchange.value.value
}

const startCountdown = () => {
  interval = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(interval)
      disabledTransaction.value = true;
      console.log("Timeout reached");
      dialog.value = true;
      startCountdownClose();
    }
  }, 1000)
}

const startCountdownClose = () => {
  interval = setInterval(() => {
    countdownClose.value--
    if (countdownClose.value === 0) {
      clearInterval(interval)
      setTimeout(() => {
        dialog.value = false
        window.close()
      }, 5000)
    }
  }, 1000)
}

window.mainApi.onPaymentRequest((data) => {
  startCountdown()
  console.log('Payment request: ', JSON.stringify(data))
  const paymentRequest = data.paymentData

  hotel.value = data.hotel
  terminals.value = data.terminals
  terminal.value = data.terminal

  exchangeTypes.value = [
    {
      value: paymentRequest.dailyExchangeRate,
      code: 'Diario'
    }
  ];

  if (paymentRequest.currency === 'MXN') {
    exchangeTypes.value.push({
      value: paymentRequest.reservation.exchangeRate,
      code: 'Reserva'
    })
  }

  exchangeTypes.value.push({
    value: paymentRequest.dailyExchangeRate,
    code: 'Fijo'
  })

  exchangeType.value = 'Diario';

  amount.value = paymentRequest.amount
  currency.value = 'USD'
  confirmationNumber.value = paymentRequest.reservation.confirmationNumber
  guest.value = paymentRequest.reservation.guest
  exchange.value = paymentRequest.dailyExchangeRate
  fixedExchange.value.value = paymentRequest.dailyExchangeRate
  transactionId.value = paymentRequest.transactionId
})

window.mainApi.onPaymentConfirmation((data) => {
  console.log('Payment confirmation: ', JSON.stringify(data))
  let success = false;
  let response = {
    confirmationNumber: confirmationNumber.value,
    guestName: guest.value,
    hotel: hotel.value.name
  }

  if (data.SaleToPOIResponse) {
    success = data.SaleToPOIResponse.PaymentResponse.Response.Result === 'Success';
    if (success) {
      const additionalResponse = JSON.parse(atob(data.SaleToPOIResponse.PaymentResponse.Response.AdditionalResponse).toString('utf-8'));
      response = {
        ...response,
        cardNumber: data.SaleToPOIResponse.PaymentResponse.PaymentResult.PaymentInstrumentData.CardData.MaskedPan,
        cardBrand: data.SaleToPOIResponse.PaymentResponse.PaymentResult.PaymentInstrumentData.CardData.PaymentBrand,
        pspReference: data.SaleToPOIResponse.PaymentResponse.PaymentResult.PaymentAcquirerData.AcquirerTransactionID.TransactionID,
        authNumber: data.SaleToPOIResponse.PaymentResponse.PaymentResult.PaymentAcquirerData.ApprovalCode,
        operationDate: data.SaleToPOIResponse.PaymentResponse.PaymentResult.PaymentAcquirerData.AcquirerTransactionID.TimeStamp,
        holderName: additionalResponse?.additionalData?.cardHolderName,
        amount: data.SaleToPOIResponse.PaymentResponse.PaymentResult.AmountsResp.AuthorizedAmount,
        currency: data.SaleToPOIResponse.PaymentResponse.PaymentResult.AmountsResp.Currency,
      }
    }
  }

  router.push({
    name: 'confirmation',
    params: {
      success,
      response: btoa(JSON.stringify(response))
    }
  })
})

window.mainApi.onPaymentClosed((data) => {
  dialogClose.value = true;
  startCountdownClose();
});

const reset = () => {
  window.mainApi.cancelPayment(transactionId.value);
  clearInterval(interval)
  window.close()
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
