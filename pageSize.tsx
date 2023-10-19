import { useRef, useEffect, useContext } from 'react'
import { ScrollContext } from './core'

import { motion } from "framer-motion"

interface PageSizeProps {
    children: React.ReactNode
}

export default function PageSizeCore(
    { children }: PageSizeProps
) {
    const ref = useRef<HTMLDivElement>(null)

    const { props, setProps } = useContext(ScrollContext)
    const { x, y, inner, direction } = props

    useEffect(() => {
        const timer = setInterval(() => {
            if (!ref.current)
                return

            const { height } = ref.current.getBoundingClientRect();
            const width = ref.current.scrollWidth

            if (inner.x === width && inner.y === height)
                return

            setProps(prev => {
                prev.inner = {
                    x: width,
                    y: height
                }
                prev.direction = height > width ? 'y' : 'x'
                return { ...prev }
            })
        }, 300)

        return () => clearInterval(timer)
    }, [inner])

    return <motion.div
        ref={ref}
        animate={direction === 'y' ? { top: -y } : { left: -x }}
        transition={{ ease: [0.07, 0.82, 0.35, 1], duration: 1 }}
        style={{
            position: 'relative'
        }}
    >
        {children}
    </motion.div>
}