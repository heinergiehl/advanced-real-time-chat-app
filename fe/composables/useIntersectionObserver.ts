type ObserveCallback = (entry: IntersectionObserverEntry) => void

export const useIntersectionObserver = (
  callback: ObserveCallback,
  options: IntersectionObserverInit = { threshold: 0.33 }
) => {
  const observer = ref<IntersectionObserver | null>(null)

  onMounted(() => {
    observer.value = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          callback(entry)
          observer.value?.unobserve(entry.target)
        }
      }
    }, options)
  })

  onBeforeUnmount(() => {
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
  })

  function observeElement(element: Element | null) {
    if (!element || !observer.value) return
    observer.value.observe(element)
  }

  return {
    observeElement,
  }
}
