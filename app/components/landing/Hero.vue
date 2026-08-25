<script setup lang="ts">
</script>

<template>
  <section class="relative overflow-hidden bg-canvas">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-25 blur-[100px] dark:opacity-40"
      style="background: radial-gradient(30% 50% at 25% 15%, #50e3c2 0%, transparent 100%),
        radial-gradient(30% 50% at 42% 5%, #0070f3 0%, transparent 100%),
        radial-gradient(30% 50% at 58% 15%, #7928ca 0%, transparent 100%),
        radial-gradient(28% 45% at 75% 10%, #eb367f 0%, transparent 100%),
        radial-gradient(22% 40% at 90% 25%, #f5a623 0%, transparent 100%);
        mask-image: linear-gradient(to bottom, black 0%, transparent 85%);
        -webkit-mask-image: linear-gradient(to bottom, black 0%, transparent 85%);"
    />

    <div class="relative mx-auto flex max-w-[1200px] flex-col items-center px-lg pt-4xl pb-2xl text-center sm:pt-section sm:pb-3xl">
      <NuxtLink
        to="/changelog"
        class="mb-lg inline-flex items-center gap-xs rounded-pill border border-hairline bg-canvas-elevated px-sm py-xxs text-xs text-body hover:text-ink"
      >
        <span class="font-mono text-[10px] uppercase tracking-wide text-mute">New</span>
        CAF v1.0.0 dirilis
      </NuxtLink>

      <h1 class="max-w-3xl text-4xl font-semibold tracking-[-1.28px] text-ink sm:text-[48px] sm:leading-[48px] sm:tracking-[-2.4px]">
        Governance ketat, dari ticket sampai PR.
      </h1>

      <p class="mt-lg max-w-2xl text-base text-body sm:text-lg">
        CAF menjalankan setiap fase — Plan, Implement, Verify, PR — dengan checkpoint
        human-review wajib. Tidak ada auto-merge. Gratis dan open, jalan langsung di
        repo kamu sendiri.
      </p>

      <div class="mt-xl flex flex-col items-center gap-sm sm:flex-row">
        <NuxtLink
          to="/docs"
          class="rounded-pill bg-ink px-md py-xs text-base font-medium text-canvas-elevated"
        >
          Get Started
        </NuxtLink>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener"
          class="rounded-pill border border-hairline bg-canvas-elevated px-md py-xs text-base font-medium text-ink"
        >
          View on GitHub
        </a>
      </div>

      <LandingCommandTabs class="mt-2xl" />
    </div>
  </section>
</template>
