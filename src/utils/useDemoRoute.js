import { useSyncExternalStore } from 'react'
import { parseDemoRoute,routeSnapshot,subscribeRoute } from './demoRouter.js'
export function useDemoRoute(){return parseDemoRoute(useSyncExternalStore(subscribeRoute,routeSnapshot))}
