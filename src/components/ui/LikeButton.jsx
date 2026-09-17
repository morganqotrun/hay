import React, { useState } from 'react'
import { Heart } from 'lucide-react'

/**
 * Interactive Like Button with custom scale-bounce micro-animation
 * @param {Object} props
 * @param {number} [props.initialCount=0]
 * @param {boolean} [props.initialLiked=false]
 * @param {Function} [props.onToggle]
 */
export default function LikeButton({
  initialCount = 0,
  initialLiked = false,
  onToggle,
  className = '',
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [bouncing, setBouncing] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)))
    setBouncing(true)

    if (onToggle) {
      onToggle(nextLiked)
    }

    setTimeout(() => {
      setBouncing(false)
    }, 450)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={liked ? 'Unlike' : 'Like'}
      className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full transition-all duration-150 cursor-pointer select-none active:scale-95 ${
        liked
          ? 'bg-magenta/15 text-magenta font-semibold'
          : 'bg-surface-subtle text-muted hover:text-main hover:bg-surface-elevated'
      } ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          bouncing ? 'animate-heart-bounce' : ''
        } ${liked ? 'fill-magenta text-magenta stroke-magenta' : 'stroke-current'}`}
      />
      <span className="text-metadata">{count}</span>
    </button>
  )
}
