import {
    useEffect, useState, createContext,
    Dispatch, SetStateAction, useContext
} from "react"


export const useResizeWindow = () => {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0
    })

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return windowSize
}

export interface ScrollLayerDataProps {
    id: string
    scroll: boolean
    direction: 'x' | 'y'
}

interface ScrollLayerProps {
    value: ScrollLayerDataProps
    setValue: Dispatch<SetStateAction<ScrollLayerDataProps>>
}

export const LayerScrollContext = createContext<ScrollLayerProps>({
    value: {
        id: '0',
        scroll: false,
        direction: 'y'
    },
    setValue: (value: SetStateAction<ScrollLayerDataProps>) => { }
})

export interface ScrollDataProps {
    x: number
    y: number
    setScroll: (
        x: number, y: number,
        addX?: number,
        addY?: number
    ) => void
    inner: {
        x: number
        y: number
    }
    outer: {
        x: number
        y: number
    },
    direction: 'x' | 'y'
}

interface ScrollContextProps {
    props: ScrollDataProps,
    setProps: Dispatch<SetStateAction<ScrollDataProps>>
}

export const ScrollContext = createContext<ScrollContextProps>({
    props: {
        x: 0, y: 0,
        setScroll: (x: number, y: number) => { },
        inner: {
            x: 0,
            y: 0
        },
        outer: {
            x: 0,
            y: 0
        },
        direction: 'y'
    },
    setProps: (value: SetStateAction<ScrollDataProps>) => { }
})

export const useScrollProps = () => useContext(ScrollContext).props


export const UseDirection = ({
    children
}: { children: React.ReactNode }) => {
    const { setValue } = useContext(LayerScrollContext)

    useEffect(() => {
        let x: number = 0
        let y: number = 0

        let time: number = new Date().getTime()

        const setDirection = (
            x: number,
            y: number
        ) => {
            setValue(prev => {
                prev.direction = y >= x ? 'y' : 'x'
                return { ...prev }
            })
        }

        const handler = ({ clientX, clientY }: { clientX: number, clientY: number }) => {
            const up: number = new Date().getTime()
            if (up < time + 100)
                return

            const diffX: number = Math.abs(clientX - x)
            const diffY: number = Math.abs(clientY - y)

            setDirection(diffX, diffY)

            time = up
            x = clientX
            y = clientY
        }

        const handlerWheel = ({ deltaX, deltaY }: { deltaX: number, deltaY: number }) => {
            setDirection(deltaX, deltaY)
        }

        window.addEventListener('mousemove', handler)
        window.addEventListener('wheel', handlerWheel)

        return () => {
            window.removeEventListener('mousemove', handler)
            window.removeEventListener('wheel', handlerWheel)
        }
    }, [])

    return children
}