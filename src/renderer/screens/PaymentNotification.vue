<template>
  <div>
    <v-dialog v-model="dialogClose" max-width="340" persistent>
      <v-list class="py-2" color="primary" elevation="12" rounded="lg" lines="three">
        <v-list-item prepend-icon="$vuetify-outline">
          <template v-slot:prepend>
            <div class="pe-4">
              <v-icon color="primary" size="60">mdi-alert</v-icon>
            </div>
          </template>
          <v-list-item-title>Transacción cancelada</v-list-item-title>
          <v-list-item-subtitle>
            Se liberó el pago por $ {{ transaction.amount }} {{ transaction.currency }}
          </v-list-item-subtitle>
          <v-list-subheader>Cerrando Ventana en...{{ countdownClose }}</v-list-subheader>
          <template v-slot:append>
            <v-progress-circular color="primary" indeterminate="disable-shrink" size="22"
              width="2"></v-progress-circular>
          </template>
        </v-list-item>
      </v-list>
    </v-dialog>
    <v-container class="pt-4 pa-12">
      <v-row no-gutters align="center" class="text-center mt-4">
        <v-col cols="12">
          <v-theme-provider with-background>
            <v-card class="pt-2" :subtitle="transactionDate" :title="transaction.hotel">
              <v-card-text>
                <v-row>
                  <v-col cols="12">
                    <p>Reservación: {{ transaction.confirmationNumber }}</p>
                    <p>Huesped: {{ transaction.guestName }}</p>
                  </v-col>
                </v-row>
                <v-row v-if="success === 'true'">
                  <v-col cols="12" class="pb-0 mb-0">
                    <v-icon color="primary" size="60">mdi-check-circle</v-icon>
                    <div>Gracias por su pago</div>
                  </v-col>
                </v-row>
                <v-row v-else>
                  <v-col cols="12">
                    <v-icon color="red" size="60">mdi-close-circle</v-icon>
                    <div>Hubo un problema al procesar tu pago</div>
                  </v-col>
                </v-row>

                <v-row v-if="success === 'true'">
                  <v-col class="text-center" cols="12">
                    <p class="text-h4 font-weight-black">$ {{ transaction.amount }} {{ transaction.currency }}</p>
                  </v-col>
                </v-row>
                <v-divider class="mt-4 mb-4"></v-divider>
                <v-row v-if="success === 'true'">
                  <v-col cols="4">
                    <p>Fecha de operación: <br> {{ transaction.operationDate }}</p>
                  </v-col>
                  <v-col cols="4">
                    <p>PSP Reference: <br> {{ transaction.pspReference }}</p>
                  </v-col>
                  <v-col cols="4">
                    <p>Número de Autorización: <br> {{ transaction.authNumber }}</p>
                  </v-col>
                  <v-col cols="4">
                    <p>Método de pago: <br> {{ transaction.cardBrand }}</p>
                  </v-col>
                  <v-col cols="4">
                    <p>Titular de la tarjeta: <br> {{ transaction.holderName }}</p>
                  </v-col>
                  <v-col cols="4">
                    <p>Terminación: <br> {{ transaction.cardNumber }}</p>
                  </v-col>

                </v-row>
                <v-row>
                  <v-col cols="12 mb-0 pb-0" class="text-center">
                    <v-btn color="#274C68" type="button" @click="cerrar()">
                      Cerrar</v-btn>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="mt-2">
                    <div class="text-medium-emphasis">
                      La ventana se cerrará en: {{ countdownClose }} segundos
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-theme-provider>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script setup>
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/es'
import { onMounted, defineProps, ref, toRefs } from 'vue'

const countdownClose = ref(10)
let interval = null;
const transaction = ref({});
dayjs.locale('es')
dayjs.extend(localizedFormat);
const transactionDate = dayjs().format('LLLL A');
const dialogClose = ref(false)

const props = defineProps({
  success: {
    type: String,
    default: "false"
  },
  response: {
    type: String,
    default: ""
  }
})

const { success, response } = toRefs(props)

onMounted(() => {
  transaction.value = JSON.parse(atob(response.value));
  interval = setInterval(() => {
    countdownClose.value -= 1
    if (countdownClose.value === 0) {
      clearInterval(interval)
      cerrar()
    }
  }, 1000)
})

const startCountdownClose = () => {
  countdownClose.value = 10;
  interval = setInterval(() => {
    countdownClose.value--
    if (countdownClose.value === 0) {
      clearInterval(interval)
      setTimeout(() => {
        dialogClose.value = false
        window.close()
      }, 5000)
    }
  }, 1000)
}

window.mainApi.onPaymentReversal((data) => {
  console.log(JSON.stringify(data));
  clearInterval(interval)
  dialogClose.value = true
  startCountdownClose()
});

const cerrar = () => {
  window.close();
};
</script>