import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

// In-memory cache for signed URLs to prevent refetching during session
const signedUrlCache = new Map()

function getConsistentRotation(seed = '') {
  if (!seed) return 0
  const sum = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  // -1.6 to +1.6 degrees
  return (((sum % 32) - 16) / 10).toFixed(1)
}

/**
 * Human-Crafted Polaroid Post Photo Frame
 * - Thin cream/warm border, 4px radius
 * - Slight consistent rotation per post (-1.6deg to +1.6deg)
 * - 1-hour signed URL from private 'posts' bucket
 */
export function PostImage({
  src,
  postId = '',
  alt = 'Foto post',
  className = '',
  style = {},
  onClick,
}) {
  const [resolvedUrl, setResolvedUrl] = useState(() => {
    if (!src) return null
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('blob:')) {
      return src
    }
    const cached = signedUrlCache.get(src)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.url
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(!resolvedUrl && !!src)
  const [hasError, setHasError] = useState(false)

  const rotation = getConsistentRotation(postId || src || '')

  useEffect(() => {
    if (!src) {
      setResolvedUrl(null)
      setIsLoading(false)
      return
    }

    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('blob:')) {
      setResolvedUrl(src)
      setIsLoading(false)
      return
    }

    // Check cache
    const cached = signedUrlCache.get(src)
    if (cached && cached.expiresAt > Date.now()) {
      setResolvedUrl(cached.url)
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setHasError(false)

    async function fetchSignedUrl() {
      try {
        const { data, error } = await supabase.storage
          .from('posts')
          .createSignedUrl(src, 3600) // 1 jam

        if (error || !data?.signedUrl) {
          console.warn('Gagal membuat signed URL untuk:', src, error)
          if (isMounted) {
            setHasError(true)
            setIsLoading(false)
          }
          return
        }

        signedUrlCache.set(src, {
          url: data.signedUrl,
          expiresAt: Date.now() + 55 * 60 * 1000,
        })

        if (isMounted) {
          setResolvedUrl(data.signedUrl)
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Error saat fetch signed URL:', err)
        if (isMounted) {
          setHasError(true)
          setIsLoading(false)
        }
      }
    }

    fetchSignedUrl()

    return () => {
      isMounted = false
    }
  }, [src])

  if (!src || hasError) {
    return null
  }

  return (
    <div
      style={{
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      className="inline-block w-full max-w-full my-2 transition-transform duration-200"
    >
      <div className="bg-[#FFFDF9] dark:bg-[#261F1A] border border-[#E8DCC8] dark:border-[#4A3C32] p-1.5 pb-4 rounded-[4px] shadow-[0_3px_10px_rgba(0,0,0,0.14)]">
        {isLoading && !resolvedUrl ? (
          <div className="w-full h-48 bg-surface-2 animate-pulse rounded-[2px] flex items-center justify-center">
            <span className="text-xs text-text-muted font-sans">Memuat foto...</span>
          </div>
        ) : (
          <img
            src={resolvedUrl}
            alt={alt}
            className={`w-full h-auto max-h-80 object-cover rounded-[2px] block ${className}`}
            onClick={onClick}
            loading="lazy"
          />
        )}
      </div>
    </div>
  )
}

export default PostImage
