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
    id: string
}

export default function UseTouch({
    children,
    hover,
    set,
    id
}: UseTouchProps) {
    const { props } = useContext(ScrollContext)

    const { value, setValue } = useContext(LayerScrollContext)
    const { scroll } = value

    const { x, y, setScroll, direction } = props

    const [move, setMove] = useState<boolean>(false)

    const [touch, setTouch] = useState<touchProps>({
        x: 0,
        y: 0
    })

    useEffect(() => {
        if (!hover)
            return

        if(value.direction !== direction)
            return
        
        if (!value.focus)
            return

        if(value.focusID !== '0')
            return

        setTouch(prev => {
            const { x, y } = value.start
            prev.x = x
            prev.y = y
            return { ...prev }
        })
        setValue(prev => {
            prev.focusID = id
            return {...prev}
        })
        setMove(true)
    }, [hover, value.direction, direction, value.focus])

    useEffect(() => {
        if(!hover)
            return

        if(value.focus)
            return

        setMove(false)
    }, [hover, value.focus])

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

        window.addEventListener('mousemove', handler)
        return () => window.removeEventListener('mousemove', handler)
    }, [move, y, touch, hover, scroll])

    return children
}