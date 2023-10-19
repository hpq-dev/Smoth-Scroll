import {
    useContext,
    useEffect,
    useState
} from "react"

import {
    LayerScrollContext,
    ScrollContext
} from "./core"


type touchProps = {
    x: number
    y: number
}

interface UseTouchProps {
    children: React.ReactNode
    hover: boolean
    set: boolean
}

export default function UseTouch({
    children,
    hover,
    set
}: UseTouchProps) {
    const { props } = useContext(ScrollContext)

    const { value } = useContext(LayerScrollContext)
    const { scroll } = value

    const { x, y, setScroll, direction } = props

    const [move, setMove] = useState<boolean>(false)

    const [touch, setTouch] = useState<touchProps>({
        x: 0,
        y: 0
    })

    useEffect(() => {
        if (!set)
            return

        const handler = ({ clientY, clientX }: MouseEvent) => {
            if (!move || scroll)
                return

            const speed: [number, number] = [
                2 + (Math.abs(touch.x - clientX) / 100),
                1 + (Math.abs(touch.y - clientY) / 50)
            ]

            setScroll(
                x + ((touch.x - clientX) * speed[0]),
                y + ((touch.y - clientY) * speed[1]),
                touch.x - clientX,
                touch.y - clientY
            )

            setTouch(prev => {
                prev.x = clientX
                prev.y = clientY
                return { ...prev }
            })
        }

        const init = ({ clientX, clientY }: MouseEvent) => {
            if (!hover)
                return

            setMove(true)
            setTouch({ x: clientX, y: clientY })
        }

        const reset = () => setMove(false)

        window.addEventListener('mousedown', init)
        window.addEventListener('mouseup', reset)
        window.addEventListener('mousemove', handler)

        return () => {
            window.removeEventListener('mousedown', init)
            window.removeEventListener('mouseup', reset)
            window.removeEventListener('mousemove', handler)
        }
    }, [move, y, touch, hover, scroll])

    return children
}