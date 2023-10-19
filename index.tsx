
import React, {
    useContext,
    useEffect,
    useRef,
    useState
} from "react"

import {
    LayerScrollContext,
    ScrollContext,
    ScrollDataProps,
    ScrollLayerDataProps,
    UseDirection,
    useResizeWindow
} from "./core"

import PageSizeCore from './pageSize'
import UseScroll from "./scroll"
import { ScrollBar } from "./scrollbar"
import { ID_SCROLLBAR } from "./settings"
import UseTouch from "./touch"


/**
 * 
 * - Touch ul ar trebui sa inceapa dupa ce se determina directia
 */

let totalScrollbars: number = 0
export const getCurrentScrolbars = (): number => totalScrollbars

interface defaultProps {
    id: number
    children: HTMLDivElement | null
}

const def: defaultProps = {
    id: 0,
    children: null
}

let setDefault: defaultProps = def

type ScrollProps = {
    children: React.ReactNode
    touch?: boolean
    scroll?: boolean
}
function CoreScroll({
    children,
    touch = false,
    scroll = true
}: ScrollProps) {
    const [props, setProps] = useState<ScrollDataProps>({
        x: 0,
        y: 0,
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
    })

    const [id, setId] = useState<string>('0')
    const ref = useRef<HTMLDivElement>(null)

    const classNameID: string = useContext(LayerScrollContext)?.value.id
    const { value, setValue } = useContext(LayerScrollContext)
    const { direction } = value

    useEffect(() => {
        setId(String(++totalScrollbars))
        setProps(prev => {
            prev.outer = {
                x: ref.current!.offsetWidth,
                y: ref.current!.offsetHeight
            }
            return { ...prev }
        })
        return () => --totalScrollbars as any
    }, [])

    return <ScrollContext.Provider value={{ props, setProps }}>
        <UseScroll
            hover={id === classNameID}
            scroll={scroll}
        >
            <UseTouch
                hover={id === classNameID}
                set={touch}
            >
                <div
                    style={ScrollStyle}
                    id={ID_SCROLLBAR}
                    className={String(id)}
                    ref={ref}
                    onMouseMove={e => {
                        if (props.direction !== direction)
                            return

                        if (new Date().getTime() - setDefault.id < 2)
                            return

                        setDefault = {
                            id: new Date().getTime(),
                            children: e.currentTarget
                        }

                        setValue(prev => {
                            prev.id = String(id)
                            console.log(`set on ${prev.id} ${props.direction} ${direction}`)
                            return { ...prev }
                        })
                    }}
                >
                    <ScrollBar />
                    <PageSizeCore>
                        {children}
                    </PageSizeCore>
                </div>
            </UseTouch>
        </UseScroll>
    </ScrollContext.Provider>
}
const ScrollStyle: React.CSSProperties = {
    position: 'relative',
    top: 0,
    width: '100%',
    overflow: 'hidden',
    height: '100vh'
}

export default function Scroll({
    children,
    touch = false,
    scroll = true
}: ScrollProps) {
    const { width } = useResizeWindow()

    return width > 550 ? <CoreScroll
        touch={touch}
        scroll={scroll}
    >{children}</CoreScroll> : children
}

interface ScrollLayerProps {
    children: React.ReactNode
}

export const ScrollLayer = ({
    children
}: ScrollLayerProps) => {
    const [value, setValue] = useState<ScrollLayerDataProps>({
        id: '0',
        scroll: false,
        direction: 'y'
    })

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const style = document.createElement("style")

            style.innerHTML = `
                body::-webkit-scrollbar { display: none; }
                body { -ms-overflow-style: none; }
                body { scrollbar-width: none; }
            `

            document.head.appendChild(style)
        }
    }, [])

    return <LayerScrollContext.Provider value={{ value, setValue }}>
        <UseDirection>
            {children}
        </UseDirection>
    </LayerScrollContext.Provider>
}