import { useEffect, useContext } from "react"
import { LayerScrollContext, ScrollContext } from "./core"

interface UseScrollProps {
    children: React.ReactNode
    hover: boolean
    scroll: boolean
}

export default function UseScroll({
    children,
    hover,
    scroll = true
}: UseScrollProps) {
    const { setValue } = useContext(LayerScrollContext)
    const { props, setProps } = useContext(ScrollContext)
    const { direction } = props

    const limit = (
        t: 'x' | 'y',
        value: number,
        inner: { x: number, y: number },
        outer: { x: number, y: number }
    ) => {
        const max = Math.abs(inner[t] - outer[t])
        return value < 0 ? 0 : value > max ? max : value
    }

    const setDirection = (x: number, y: number) => {
        setValue(prev => {
            prev.direction = y > x ? 'y' : 'x'
            return { ...prev }
        })
    }

    const setScroll = (
        x: number, y: number,
        addX: number = 0,
        addY: number = 0
    ) => {
        setProps(prev => {
            const { inner, outer, direction } = prev

            setDirection(addX, addY)

            if (direction === 'y')
                prev.y = limit('y', y, inner, outer)

            else
                prev.x = limit('x', x, inner, outer)

            return { ...prev }
        })
    }

    useEffect(() => {
        setProps(prev => {
            prev.setScroll = setScroll
            return { ...prev }
        })
    }, [])

    useEffect(() => {
        if (!scroll)
            return

        const hendler = ({ deltaY }: { deltaY: number }) => {
            if (!hover)
                return

            if (direction !== 'y')
                return

            setProps(prev => {
                prev.y = limit('y', prev.y + deltaY, prev.inner, prev.outer)
                return { ...prev }
            })
        }
        window.addEventListener('wheel', hendler)
        return () => window.removeEventListener('wheel', hendler)
    }, [hover, direction]);

    return <>
        {children}
    </>
}