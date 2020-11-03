import React, { useCallback, useState, useEffect, useRef } from "react"
import { BackHandler } from "react-native"
import { PartialState, NavigationState, NavigationContainerRef } from "@react-navigation/native"

export const RootNavigation = {
  navigate(name: string) {
    name // eslint-disable-line no-unused-expressions
  },
  goBack() { }, // eslint-disable-line @typescript-eslint/no-empty-function
  resetRoot(state?: PartialState<NavigationState> | NavigationState) { }, // eslint-disable-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  getRootState(): NavigationState {
    return {} as any
  },
}

export const setRootNavigation = (ref: React.RefObject<NavigationContainerRef>) => {
  for (const method in RootNavigation) {
    RootNavigation[method] = (...args: any) => {
      if (ref.current) {
        return ref.current[method](...args)
      }
    }
  }
}
export function getActiveRouteName(state: NavigationState | PartialState<NavigationState>) {
  const route = state.routes[state.index]
  if (!route.state) return route.name
  return getActiveRouteName(route.state)
}

export function useBackButtonHandler(
  ref: React.RefObject<NavigationContainerRef>,
  canExit: (routeName: string) => boolean,
) {
  const canExitRef = useRef(canExit)

  useEffect(() => {
    canExitRef.current = canExit
  }, [canExit])

  useEffect(() => {

    const onBackPress = () => {
      const navigation = ref.current

      if (navigation == null) {
        return false
      }

      const routeName = getActiveRouteName(navigation.getRootState())

      if (canExitRef.current(routeName)) {
        return false
      }

      if (navigation.canGoBack()) {
        navigation.goBack()

        return true
      }

      return false
    }

    BackHandler.addEventListener("hardwareBackPress", onBackPress)

    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress)
  }, [ref])
}

export function useNavigationPersistence(storage: any, persistenceKey: string) {
  const [initialNavigationState, setInitialNavigationState] = useState()
  const [isRestoringNavigationState, setIsRestoringNavigationState] = useState(true)

  const routeNameRef = useRef()
  const onNavigationStateChange = (state) => {
    const previousRouteName = routeNameRef.current
    const currentRouteName = getActiveRouteName(state)

    if (previousRouteName !== currentRouteName) {
      __DEV__ && console.tron.log(currentRouteName)
    }

    routeNameRef.current = currentRouteName

    storage.save(persistenceKey, state)
  }

  const restoreState = useCallback(async () => {
    try {
      const state = await storage.load(persistenceKey)
      if (state) setInitialNavigationState(state)
    } finally {
      setIsRestoringNavigationState(false)
    }
  }, [persistenceKey, storage])

  useEffect(() => {
    if (isRestoringNavigationState) restoreState()
  }, [isRestoringNavigationState, restoreState])

  return { onNavigationStateChange, restoreState, initialNavigationState }
}
