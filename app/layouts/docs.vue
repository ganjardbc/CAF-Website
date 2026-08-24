<template>
  <div class="flex min-h-screen flex-col">
    <SharedNavbar />
    <div class="mx-auto flex w-full max-w-[1200px] flex-1 gap-xl px-lg py-xl">
      <aside class="hidden w-56 shrink-0 border-r border-hairline pr-lg lg:block">
        <DocsSidebar />
      </aside>
      <main class="min-w-0 flex-1">
        <slot />
      </main>
    </div>
    <SharedFooter />
  </div>
</template>
