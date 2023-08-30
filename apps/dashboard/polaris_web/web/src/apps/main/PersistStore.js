import {create} from "zustand"
import {devtools, persist, createJSONStorage} from "zustand/middleware"

let persistStore = (set) => ({
    leftNavSelected: '',
    setLeftNavSelected: (selected) =>  set({ leftNavSelected: selected }), 
    
    accessToken: null,
    storeAccessToken: (accessToken) => set({ accessToken: accessToken }),

    quickstartTasksCompleted: 0,
    setQuickstartTasksCompleted: (quickstartTasksCompleted)=>{
        set({quickstartTasksCompleted: quickstartTasksCompleted})
    },
    subCategoryMap: {},
    setSubCategoryMap: (subCategoryMap) => set({subCategoryMap: subCategoryMap}),
    subCategoryFromSourceConfigMap: {},
    setSubCategoryFromSourceConfigMap: (subCategoryFromSourceConfigMap) => set({subCategoryFromSourceConfigMap: subCategoryFromSourceConfigMap})
})

persistStore = devtools(persistStore)
persistStore = persist(persistStore,{storage: createJSONStorage(() => sessionStorage)})

const PersistStore = create(persistStore);

export default PersistStore

