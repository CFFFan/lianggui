const useProjectStore = defineStore(
  'project',
  {
    state: () => ({
      selectedProjectId: null
    }),
    actions: {
      setSelectedProjectId(projectId) {
        this.selectedProjectId = projectId
      },
      clearSelectedProjectId() {
        this.selectedProjectId = null
      }
    }
  }
)

export default useProjectStore


