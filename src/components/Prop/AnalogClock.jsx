import { useState, useEffect } from "react"

export default function AnalogClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const seconds = time.getSeconds()
  const minutes = time.getMinutes()
  const hours = time.getHours() % 12

  // Calculate angles for each hand
  const secondAngle = seconds * 6 - 90 // 6 degrees per second
  const minuteAngle = minutes * 6 + seconds * 0.1 - 90 // 6 degrees per minute + smooth seconds
  const hourAngle = hours * 30 + minutes * 0.5 - 90 // 30 degrees per hour + smooth minutes

  // Format digital time
  const digitalTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })

  // Get day of week
  const dayOfWeek = time.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()

  const tickMarks = Array.from({ length: 12 }, (_, i) => {
    const angle = i * 30
    const x = 50 + 42 * Math.cos(((angle - 90) * Math.PI) / 180)
    const y = 50 + 42 * Math.sin(((angle - 90) * Math.PI) / 180)

    const isMajorTick = i % 3 === 0
    const tickHeight = isMajorTick ? "h-6" : "h-4"
    const tickWidth = isMajorTick ? "w-0.5" : "w-px"

    return (
      <div
        key={i}
        className={`absolute ${tickWidth} ${tickHeight} bg-black`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
        }}
      />
    )
  })

  return (
    <div className="w-64 h-64 bg-white rounded-2xl border border-orange-500 p-6 flex flex-col items-center justify-center">
      {/* Clock Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Tick Marks */}
          <div className="absolute inset-0">{tickMarks}</div>

          {/* Clock Center Dot */}
          <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-black rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30" />

          {/* Hour Hand */}
          <div
            className="absolute top-1/2 left-1/2 w-1 bg-black rounded-full origin-bottom z-20 transition-transform duration-1000 ease-in-out"
            style={{
              height: "60px",
              transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
            }}
          />

          {/* Minute Hand */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 bg-black rounded-full origin-bottom z-20 transition-transform duration-1000 ease-in-out"
            style={{
              height: "80px",
              transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
            }}
          />

          {/* Second Hand */}
          <div
            className="absolute top-1/2 left-1/2 w-0.5 bg-orange-500 rounded-full origin-bottom z-20 transition-transform duration-75 ease-out"
            style={{
              height: "85px",
              transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
            }}
          />

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10">
            <div className="bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-md">
              <div className="text-white text-sm font-normal tracking-wide">
                {dayOfWeek} {digitalTime}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12">
          <div className="bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-md">
            <div className="text-white text-sm font-normal">Bengaluru</div>
          </div>
        </div>
      </div>
    </div>
  )
}
