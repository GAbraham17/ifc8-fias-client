<script setup lang="tsx">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route: any = useRoute()

const handleRoute = (path: string): void => {
  router.push(path)
}

const isCurrentRoute = (path: string): boolean => {
  return path === route.path
}
</script>
<template>
  <v-app-bar color="#274C68" density="compact">
    <img height="30" class="mx-6" src="/images/logo.svg" />
    <v-spacer></v-spacer>
    <template #append>
      <v-btn
        prepend-icon="mdi-home"
        variant="text"
        :class="{ active: isCurrentRoute('/') }"
        @click="handleRoute('/')"
      >
        Inicio
      </v-btn>
      <v-btn
        prepend-icon="mdi-cog"
        variant="text"
        :class="{ active: isCurrentRoute('/second') }"
        @click="handleRoute('/second')"
      >
        Configuración
      </v-btn>
    </template>
  </v-app-bar>
</template>
<style scoped>
.v-btn {
  opacity: 0.4;
}
.active {
  opacity: 1 !important;
}
</style>
