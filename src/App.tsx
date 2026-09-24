import { useState } from 'react'

import { AppRoutes } from './routes/AppRoutes'
import { CustomCursor } from '@/components/common/CustomCursor'
import { SplashScreen } from '@/components/common/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      <CustomCursor />

      <AppRoutes />

      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
        />
      )}
    </>
  )
}

export default App