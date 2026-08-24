<template>
  <div class="flex min-h-screen flex-col">
    <SharedNavbar />
    <main class="flex-1">
      <slot />
    </main>
    <SharedFooter />
  </div>
</template>
