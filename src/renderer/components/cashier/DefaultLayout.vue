<script setup lang="tsx">
import HeaderLayout from '@/renderer/components/cashier/HeaderLayout.vue'
</script>

<template>
  <v-app>
    <v-layout>
      <HeaderLayout />
      <v-main>
        <slot />
      </v-main>
    </v-layout>
  </v-app>
</template>
