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
    direction: 'x' | 'y' | null,
    start: {
        x: number
        y: number
    }
    focus: boolean
    focusID: string
}

interface ScrollLayerProps {
    value: ScrollLayerDataProps
    setValue: Dispatch<SetStateAction<ScrollLayerDataProps>>
}

export const LayerScrollContext = createContext<ScrollLayerProps>({
    value: {
        id: '0',
        scroll: false,
        direction: null,
        start: {
            x: 0,
            y: 0
        },
        focus: false,
        focusID: '0'
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

    const currentTime = (): number =>
        new Date().getTime()

    const reset = (): void => setValue(prev => {
        prev.direction = null
        prev.focus = false
        prev.focusID = '0'
        return { ...prev }
    })

    useEffect(() => {
        let x: number = 0
        let y: number = 0

        let focus: boolean = false
        let set: 'x' | 'y' | null = null

        let time: number = currentTime()

        const setDirection = (
            x: number,
            y: number
        ): 'x' | 'y' => {
            const dir = Math.abs(y) >= Math.abs(x) ? 'y' : 'x'
            setValue(prev => {
                prev.direction = dir
                return { ...prev }
            })

            return dir
        }

        const handler = ({ clientX, clientY }: { clientX: number, clientY: number }): void => {
            if (!focus)
                return

            if (set)
                return

            const up: number = currentTime()
            if (up < time + 20)
                return

            const diffX: number = Math.abs(clientX - x)
            const diffY: number = Math.abs(clientY - y)

            set = setDirection(diffX, diffY)

            time = up
            x = clientX
            y = clientY
        }

        const handlerWheel = ({ deltaX, deltaY }: { deltaX: number, deltaY: number }): void => {
            if (set)
                return

            setDirection(deltaX, deltaY)

            setTimeout(() => setValue(prev => {
                prev.direction = null
                return { ...prev }
            }), 100);
        }

        const handlerClick = ({ clientX, clientY }: { clientX: number, clientY: number }): void => {
            if (focus)
                return

            x = clientX
            y = clientY
            time = currentTime()
            focus = true
            set = null

            setValue(prev => {
                prev.direction = null
                prev.start = {
                    x: clientX,
                    y: clientY
                }
                prev.focus = true
                return { ...prev }
            })
        }

        const handlerClickLeave = (): void => {
            reset()
            focus = false

            set = null
        }

        window.addEventListener('mousemove', handler)
        window.addEventListener('wheel', handlerWheel)
        window.addEventListener('mousedown', handlerClick)
        window.addEventListener('mouseup', handlerClickLeave)

        return () => {
            window.removeEventListener('mousemove', handler)
            window.removeEventListener('wheel', handlerWheel)
            window.removeEventListener('mousedown', handlerClick)
            window.removeEventListener('mouseup', handlerClickLeave)
        }
    }, [])

    return children
}