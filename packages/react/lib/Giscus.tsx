import React, { useEffect, useState } from 'react'
import { GiscusProps } from '@shared/types'
import {
  addDefaultStyles,
  createErrorMessageListener,
  formatError,
  getIframeSrc,
  GISCUS_ORIGIN,
  GISCUS_SESSION_KEY
} from '@shared/util'
import IframeResizer from 'iframe-resizer-react'

function GiscusClient(props: GiscusProps) {
  const origin = location.href.replace(location.hash || '', '')
  const url = new URL(origin)
  const savedSession = localStorage.getItem(GISCUS_SESSION_KEY)

  const [session, setSession] = useState(url.searchParams.get('giscus') || '')

  useEffect(() => {
    if (session) {
      localStorage.setItem(GISCUS_SESSION_KEY, JSON.stringify(session))
      url.searchParams.delete('giscus')
      history.replaceState(undefined, document.title, url.toString())
      return
    }

    if (savedSession) {
      try {
        setSession(JSON.parse(savedSession || '') || '')
      } catch (e) {
        setSession('')
        localStorage.removeItem(GISCUS_SESSION_KEY)
        console.warn(`${formatError(e?.message)} Session has been cleared.`)
      }
    }
  }, [])

  useEffect(addDefaultStyles, [])

  useEffect(() => {
    const listener = createErrorMessageListener(() => setSession(''))
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])

  const src = getIframeSrc({ ...props, session })

  return (
    <div className="giscus">
      <IframeResizer
        className="giscus-frame"
        title="Comments"
        src={src}
        checkOrigin={[GISCUS_ORIGIN]}
      />
    </div>
  )
}

export default function Giscus({
  repo,
  repoId,
  category,
  categoryId,
  mapping,
  term,
  theme,
  reactionsEnabled,
  emitMetadata
}: GiscusProps) {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  if (!isMounted) return null
  return (
    <GiscusClient
      repo={repo}
      repoId={repoId}
      category={category}
      categoryId={categoryId}
      mapping={mapping}
      term={term}
      theme={theme}
      reactionsEnabled={reactionsEnabled}
      emitMetadata={emitMetadata}
    />
  )
}
