import { defineStore } from "pinia"

export const useSideTabsStore = defineStore("sidebarStore", {
  state: () => ({ activeTabIndex: "0" }),
  actions: {
    setActiveTabIndex(index: string) {
      this.activeTabIndex = index
    },
  },
})
