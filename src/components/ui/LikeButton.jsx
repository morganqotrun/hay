import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from '@phosphor-icons/react'

/**
 * Human-Crafted Like Button with Framer Motion spring bounce
 */
export default function LikeButton({
  initialCount = 0,
  initialLiked = false,
  onToggle,
  className = '',
}) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)

  const handleClick = (e) => {
    e.stopPropagation()
    const nextLiked = !liked
    setLiked(nextLiked)
    setCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)))
    if (onToggle) {
      onToggle(nextLiked)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={liked ? 'Batal Suka' : 'Suka'}
      className={`inline-flex items-center gap-1.5 py-1 px-2 rounded-full transition-colors duration-150 cursor-pointer select-none active:scale-95 ${
        liked
          ? 'text-[#FF6A3D] font-bold'
          : 'text-muted hover:text-main'
      } ${className}`}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.35, 0.9, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
      >
        <Heart
          size={18}
          weight={liked ? 'fill' : 'bold'}
          className={liked ? 'text-[#FF6A3D]' : 'text-current'}
        />
      </motion.div>
      <span className="text-xs font-sans">{count}</span>
    </button>
  )
}
