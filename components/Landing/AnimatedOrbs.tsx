import React, { useMemo } from 'react'

interface StarPosition {
  id: number
  left: number
  top: number
  delay: number
}

export function AnimatedOrbs() {
  const stars = useMemo<StarPosition[]>(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
    }))
  }, [])

  return (
    <div className="animated-orbs" aria-hidden="true">
      {/* Starfield background */}
      <div className="starfield">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Animated orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  )
}
