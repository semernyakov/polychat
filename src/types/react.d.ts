import * as React from 'react';
import { Plugin } from 'obsidian';
import { ReactNode } from 'react';

declare module 'react' {
    export interface FunctionComponent<P = {}> {
        (props: P, context?: any): React.ReactElement<any, any> | null;
        displayName?: string;
        defaultProps?: Partial<P>;
    }

    export interface FC<P = {}> extends FunctionComponent<P> {}

    export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
        type: T;
        props: P;
        key: Key | null;
    }

    export type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;

    export interface ReactPortal extends ReactElement {
        key: Key | null;
        children: ReactNode;
    }

    export type ReactFragment = {} | ReactNodeArray;
    export interface ReactNodeArray extends Array<ReactNode> {}

    export type Key = string | number;

    export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<any, any>);

    export class Component<P = {}, S = {}> {
        constructor(props: P, context?: any);
        setState(state: S | ((prevState: S, props: P) => S), callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        render(): ReactNode;
        readonly props: Readonly<P>;
        state: Readonly<S>;
        context: any;
        refs: {
            [key: string]: Component<any, any>;
        };
    }

    export interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        className?: string;
        id?: string;
        role?: string;
        tabIndex?: number;
        style?: CSSProperties;
        css?: unknown;
    }

    export interface DOMAttributes<T> {
        children?: ReactNode;
        dangerouslySetInnerHTML?: {
            __html: string;
        };
        onClick?: (event: MouseEvent<T>) => void;
        onKeyPress?: (event: KeyboardEvent<T>) => void;
        onChange?: (event: ChangeEvent<T>) => void;
        onResize?: (event: unknown) => void;
    }

    export interface AriaAttributes {
        'aria-label'?: string;
        'aria-hidden'?: boolean;
    }

    export interface CSSProperties {
        [key: string]: string | number;
    }

    export interface ChangeEvent<T = Element> {
        target: EventTarget & T;
    }

    export interface KeyboardEvent<T = Element> {
        key: string;
        shiftKey: boolean;
        preventDefault(): void;
    }

    export interface MouseEvent<T = Element> {
        preventDefault(): void;
    }

    export interface EventTarget {
        value: string;
    }

    // Добавляем определения для JSX
    export namespace JSX {
        interface IntrinsicElements {
            div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
            button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
            textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
            span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
            input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
            'style-jsx'?: StyleHTMLAttributes<HTMLStyleElement>;
        }
    }

    // Добавляем определения для хуков
    export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
    export function useEffect(effect: () => void | (() => void | undefined), deps?: ReadonlyArray<any>): void;
    export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: ReadonlyArray<any>): T;
}

declare global {
    interface Window {
        ReactNativeWebView: {
            postMessage: (message: string) => void;
        };
    }
}

export interface PluginProps {
    plugin: Plugin;
}

export type ReactComponent = (props: Record<string, unknown>) => ReactNode;

export interface ModalProps {
    onClose: () => void;
}

export interface ViewProps extends PluginProps {
    leaf: unknown;
}

declare global {
    namespace JSX {
        interface Element extends React.ReactElement<unknown, unknown> {}
        interface ElementClass extends React.Component<unknown> {
            render(): React.ReactNode;
        }
        interface ElementAttributesProperty {
            props: unknown;
        }
        interface ElementChildrenAttribute {
            children: unknown;
        }
        interface IntrinsicAttributes extends React.Attributes {}
        interface IntrinsicClassAttributes<T> extends React.ClassAttributes<T> {}
        interface IntrinsicElements {
            [elemName: string]: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

export interface ReactProps {
    children?: ReactNode;
}

export interface ReactState {
    [key: string]: unknown;
}

export interface ReactComponent<P = Record<string, unknown>, S = Record<string, unknown>> {
    new(props: P): ReactComponentInstance<P, S>;
}

export interface ReactComponentInstance<P, S> {
    props: P;
    state: S;
    setState(state: Partial<S>, callback?: () => void): void;
    forceUpdate(callback?: () => void): void;
    render(): ReactNode;
}

export interface ReactElement<P = Record<string, unknown>> {
    type: string | ReactComponent<P>;
    props: P;
    key: string | null;
}

export interface ReactFragment {
    [key: string]: ReactNode;
}

export type ReactText = string | number;
export type ReactChild = ReactElement | ReactText;

export interface ReactNodeArray extends Array<ReactNode> {}

export type ReactNode = ReactChild | ReactFragment | ReactNodeArray | boolean | null | undefined;

export interface ReactPortal extends ReactElement {
    key: string | null;
    children: ReactNode;
} 