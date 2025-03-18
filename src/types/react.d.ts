import * as React from 'react';
import { Plugin } from 'obsidian';

declare module 'react' {
    interface FunctionComponent<P = Record<string, unknown>> {
        (props: P, context?: unknown): ReactElement | null;
        displayName?: string;
        defaultProps?: Partial<P>;
    }

    interface FC<P = Record<string, unknown>> extends FunctionComponent<P> {}

    interface ReactElement<P = unknown> {
        type: string | ((props: P) => ReactElement | null);
        props: P;
        key: string | number | null;
    }

    type ReactText = string | number;
    type ReactChild = ReactElement | ReactText;
    type ReactFragment = Record<string, unknown> | ReactNodeArray;
    interface ReactNodeArray extends Array<ReactNode> {}
    type ReactNode = ReactChild | ReactFragment | boolean | null | undefined;

    interface Component<P = Record<string, unknown>, S = Record<string, unknown>> {
        render(): ReactNode;
        readonly props: Readonly<P>;
        state: Readonly<S>;
        setState(state: S | ((prevState: S, props: P) => S), callback?: () => void): void;
        forceUpdate(callback?: () => void): void;
        context: unknown;
    }

    interface DOMAttributes {
        children?: ReactNode;
        dangerouslySetInnerHTML?: { __html: string };
        onClick?: (event: MouseEvent) => void;
        onKeyPress?: (event: KeyboardEvent) => void;
        onChange?: (event: ChangeEvent) => void;
    }

    interface HTMLAttributes extends DOMAttributes {
        className?: string;
        id?: string;
        style?: Record<string, string | number>;
    }

    interface ChangeEvent {
        target: { value: string };
    }

    interface KeyboardEvent {
        key: string;
        shiftKey: boolean;
        preventDefault(): void;
    }

    interface MouseEvent {
        preventDefault(): void;
    }
}

export interface PluginProps {
    plugin: Plugin;
}

export interface ViewProps extends PluginProps {
    leaf: unknown;
}

export interface ModalProps {
    onClose: () => void;
}

export type ReactComponent = (props: Record<string, unknown>) => React.ReactNode;

declare global {
    interface Window {
        ReactNativeWebView: {
            postMessage: (message: string) => void;
        };
    }
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

export interface ReactComponent<P = Record<string, unknown>> {
    new(props: P): ReactComponentInstance<P>;
}

export interface ReactComponentInstance<P> {
    props: P;
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