import React, { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function TransliterateInput({ value, onChange, className, ...props }) {
  const { lang } = useLanguage()
  const [localValue, setLocalValue] = useState(value || '')
  
  useEffect(() => {
    setLocalValue(value || '')
  }, [value])

  const handleKeyDown = async (e) => {
    if (lang !== 'te') return
    
    // When space or Enter is pressed, transliterate the last word
    if (e.key === ' ' || e.key === 'Enter') {
      const words = localValue.split(' ')
      const lastWord = words[words.length - 1]
      
      if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
        e.preventDefault()
        try {
          const res = await fetch(`https://inputtools.google.com/request?text=${lastWord}&itc=te-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`)
          const data = await res.json()
          if (data[0] === 'SUCCESS' && data[1][0][1][0]) {
            const transliterated = data[1][0][1][0]
            words[words.length - 1] = transliterated
            
            const newValue = words.join(' ') + (e.key === ' ' ? ' ' : '')
            setLocalValue(newValue)
            
            if (onChange) {
              onChange({ target: { value: newValue } })
            }
            return
          }
        } catch (err) {
          console.error('Transliteration failed:', err)
        }
        
        // Fallback to inserting the space anyway if transliteration fails
        const newValue = localValue + (e.key === ' ' ? ' ' : '')
        setLocalValue(newValue)
        if (onChange) onChange({ target: { value: newValue } })
      }
    }
  }

  const handleChange = (e) => {
    setLocalValue(e.target.value)
    if (onChange) onChange(e)
  }

  const handleBlur = async (e) => {
    if (lang !== 'te') {
      if (props.onBlur) props.onBlur(e)
      return
    }
    const words = localValue.split(' ')
    const lastWord = words[words.length - 1]
    if (lastWord && /^[a-zA-Z]+$/.test(lastWord)) {
      try {
        const res = await fetch(`https://inputtools.google.com/request?text=${lastWord}&itc=te-t-i0-und&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8&app=demopage`)
        const data = await res.json()
        if (data[0] === 'SUCCESS' && data[1][0][1][0]) {
          const transliterated = data[1][0][1][0]
          words[words.length - 1] = transliterated
          const newValue = words.join(' ')
          setLocalValue(newValue)
          if (onChange) {
            onChange({ target: { value: newValue } })
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    if (props.onBlur) props.onBlur(e)
  }

  return (
    <input 
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={className}
      {...props}
    />
  )
}
