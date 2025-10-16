import React, { useEffect, useRef, useState } from 'react'


export default function SmartTransition({ transitionKey, className = '', children, duration = 250 }) {
  const [phase, setPhase] = useState('enter') // 'enter' | 'steady' | 'exit'
  const prevKeyRef = useRef(transitionKey)

  useEffect(() => {
    if (prevKeyRef.current !== transitionKey) {
      // trigger exit for old content
      setPhase('exit')
      const t = setTimeout(() => {
        // switch to new key and run enter
        prevKeyRef.current = transitionKey
        setPhase('enter')
        // after a tick go steady
        setTimeout(() => setPhase('steady'), 16)
      }, duration)
      return () => clearTimeout(t)
    } else {
      // initial mount or same key
      setPhase('steady')
    }
  }, [transitionKey, duration])

  const base = 'transition-all ease-out'
  const style = { transitionDuration: `${duration}ms` }
  const phaseClass = phase === 'exit'
    ? 'translate-x-6 opacity-0'
    : phase === 'enter'
      ? '-translate-x-6 opacity-0'
      : 'translate-x-0 opacity-100'

  return (
    <div className={`${base} ${phaseClass} ${className}`} style={style}>
      {children}
    </div>
  )
}
