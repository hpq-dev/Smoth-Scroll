import { useContext, useEffect, useRef, useState } from "react"
import { HIDE_SCROLLBAR_TIME } from "./settings"
import { LayerScrollContext, ScrollContext } from "./core"

type ScrollMoveProps = {
    toggle: boolean
    pos: {
        x: number
        y: number
    }
}

export const ScrollBar = () => {
    const { props } = useContext(ScrollContext)
    const { setValue } = useContext(LayerScrollContext)

    const { direction, inner, outer, x, y, setScroll } = props

    const ref = useRef<HTMLDivElement>(null)

    const [move, setMove] = useState<ScrollMoveProps>({
        toggle: false,
        pos: {
            x: 0,
            y: 0
        }
    })

    const [show, setShow] = useState<boolean>(false)
    const [active, setActive] = useState<boolean>(false);

    const reset = () => setMove({
        toggle: false,
        pos: {
            x: 0,
            y: 0
        }
    })

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (!move.toggle)
                return

            if (direction === 'y') {
                const y = ((e.clientY - move.pos.y) / outer.y) * inner.y
                setScroll(0, y)
            } else {
                const x = ((e.clientX - move.pos.x) / outer.x) * inner.x
                setScroll(x, 0)
            }
        }

        window.addEventListener('mousemove', handler)
        window.addEventListener('mouseup', reset)

        return () => {
            window.removeEventListener('mousemove', handler)
            window.removeEventListener('mouseup', reset)
        }
    }, [move, ref, setScroll])

    useEffect(() => {
        setShow(true)
        const timer = setTimeout(() => setShow(false), 500);
        return () => clearTimeout(timer)
    }, [y])

    useEffect(() => {
        if (show) setActive(true)
        else {
            const timer = setTimeout(() => { setActive(false), setShow(false) }, HIDE_SCROLLBAR_TIME)
            return () => clearTimeout(timer)
        }
    }, [show])

    useEffect(() => setValue(prev => {
        prev.scroll = move.toggle
        return { ...prev }
    }), [move.toggle])

    const height: number = (outer.y / inner.y) * outer.y

    return <div
        style={direction === 'y' ?
            {
                position: 'absolute',
                right: 0,
                top: 0,
                zIndex: 9999,
                width: '20px',
                height: '100%'
            } : {
                position: 'absolute',
                bottom: 0,
                left: 0,
                zIndex: 9999,
                width: '100%',
                height: '20px'
            }
        }
        ref={ref}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
    >
        <div
            style={direction === 'y' ? {
                position: 'absolute',
                right: '5px',
                width: '10px',
                top: 5 + ((y / inner.y) * outer.y),
                borderRadius: '1vh',
                height: `${height - 10}px`,
                background: !active ? 'rgba(255,255,0,.2)' : 'rgba(255,255,0,1)',
                transition: `background .${active ? 2 : 5}s ease-out`,
                zIndex: 1
            } : {
                position: 'absolute',
                bottom: '5px',
                width: `${height - 10}px`,
                height: '10px',
                left: ((x / inner.x) * outer.y),
                borderRadius: '1vh',
                background: !active ? 'rgba(255,255,0,.2)' : 'rgba(255,255,0,1)',
                transition: `background .${active ? 2 : 5}s ease-out`,
                zIndex: 1
            }}
            onMouseDown={(e) => {
                if (!ref.current)
                    return

                const { y } = ref.current.getBoundingClientRect();
                setMove({
                    toggle: true,
                    pos: {
                        x: e.nativeEvent.offsetX,
                        y: e.nativeEvent.offsetY + y
                    }
                })
            }}
        />
    </div>
}