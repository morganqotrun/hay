import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'

const ContentContext = createContext({
  contentMap: {},
  contentList: [],
  isLoading: false,
  t: (_key, fallback = '') => fallback,
  getContent: (_key, fallback = '') => fallback,
  renderContent: (_key, fallback = '') => fallback,
  updateContent: async () => {},
  refreshContent: async () => {},
})

const STORAGE_KEY = 'hay_app_content'

/**
 * Render helper: converts **kata** into Fraunces italic with wavy underline
 */
export function renderFormattedHeadline(rawText = '', vars = {}) {
  if (!rawText) return null

  // Replace variable templates like {nama} or {n}
  let interpolated = rawText
  Object.keys(vars).forEach((vKey) => {
    interpolated = interpolated.replace(new RegExp(`\\{${vKey}\\}`, 'g'), vars[vKey] ?? '')
  })

  // Parse **word** into wavy underline span
  const parts = interpolated.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const cleanWord = part.slice(2, -2)
      return (
        <span key={index} className="highlight-wavy text-[#FF6A3D]">
          {cleanWord}
        </span>
      )
    }
    return <React.Fragment key={index}>{part}</React.Fragment>
  })
}

export function ContentProvider({ children }) {
  const [contentMap, setContentMap] = useState(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      return cached ? JSON.parse(cached) : {}
    } catch {
      return {}
    }
  })
  const [contentList, setContentList] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchContent = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('app_content')
        .select('key, value, label, grup, updated_at')
        .order('grup', { ascending: true })

      if (!error && data && data.length > 0) {
        const newMap = {}
        data.forEach((item) => {
          newMap[item.key] = item.value
        })
        setContentMap(newMap)
        setContentList(data)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMap))
      }
    } catch (err) {
      console.warn('App content sync notice (using cached / fallback):', err?.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const getContent = useCallback(
    (key, fallback = '', vars = {}) => {
      let val = contentMap[key] !== undefined ? contentMap[key] : fallback
      if (vars && typeof val === 'string') {
        Object.keys(vars).forEach((vKey) => {
          val = val.replace(new RegExp(`\\{${vKey}\\}`, 'g'), vars[vKey] ?? '')
        })
      }
      return val
    },
    [contentMap]
  )

  const renderContent = useCallback(
    (key, fallback = '', vars = {}) => {
      const val = contentMap[key] !== undefined ? contentMap[key] : fallback
      return renderFormattedHeadline(val, vars)
    },
    [contentMap]
  )

  const updateContent = useCallback(async (key, newValue) => {
    try {
      const { error } = await supabase
        .from('app_content')
        .update({
          value: newValue,
          updated_at: new Date().toISOString(),
        })
        .eq('key', key)

      if (error) throw error

      setContentMap((prev) => {
        const next = { ...prev, [key]: newValue }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })

      setContentList((prev) =>
        prev.map((item) => (item.key === key ? { ...item, value: newValue } : item))
      )

      return { success: true }
    } catch (err) {
      console.error('Failed to update app_content:', err)
      return { success: false, error: err }
    }
  }, [])

  const value = useMemo(
    () => ({
      contentMap,
      contentList,
      isLoading,
      // t() is an alias for getContent() — plain string with interpolation
      t: getContent,
      getContent,
      renderContent,
      updateContent,
      refreshContent: fetchContent,
    }),
    [contentMap, contentList, isLoading, getContent, renderContent, updateContent, fetchContent]
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}

export function useContent(key, fallback = '', vars = {}) {
  const { getContent, renderContent } = useContext(ContentContext)
  const text = getContent(key, fallback, vars)
  const render = () => renderContent(key, fallback, vars)

  return {
    text,
    render,
    toString: () => text,
  }
}

export function useContentContext() {
  return useContext(ContentContext)
}

export default useContent
