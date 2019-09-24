import React from 'react';
import * as PropTypes from 'prop-types';

// A strongly typed version of `createReactClass()` which aims for compatibility with Flow’s
// support for `createReactClass()`. We make various type safety compromises to ease the use of
// `createReactClass()` at Airtable.
export default function createReactClass<
    // We don’t type check known React methods like `render()` or `componentDidUpdate()`.
    //
    // 1. If we put them in the supertype, here, and they fail to type check you get strange
    //    unrelated errors.
    // 2. If we add them to the intersection of `Spec & ThisType<...>` below then TypeScript
    //    won’t be able to fully infer `Spec`.
    //
    // The tradeoff we make here is no type checking for known methods so that we get complete
    // type checking for custom methods.
    Spec extends {propTypes?: unknown, getInitialState?: unknown}
>(
    spec: Spec & ThisType<ComponentInstance<Spec>>,
): React.ComponentType<
    // Infer the type of our component’s props from the `React.createClass` spec.
    PropTypes.InferProps<Spec['propTypes']> &

    // Make sure `ref` has the correct type.
    {ref?: React.Ref<ComponentInstance<Spec>>}
>;

type ComponentInstance<Spec extends {propTypes?: unknown, getInitialState?: unknown}> =
    // All methods in the spec are available with `this`.
    Spec &

    // Infer the types of props and state from our spec.
    ComponentInstanceBase<
        PropTypes.InferProps<Spec['propTypes']>,
        InferState<Spec>
    > &

    // Any properties which weren’t handled by the above are treated as `any`. This is
    // required for Airtable’s mixin support since `EventListenerMixin` adds generated
    // methods to the class.
    {[key: string]: any};

type InferState<Spec extends {getInitialState?: unknown}> =
    Spec['getInitialState'] extends (...args: any) => infer State ? State : {};

type ComponentInstanceBase<P, S> = {
    props: P,
    state: S,

    setState<K extends keyof S>(
        state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
        callback?: () => void
    ): void;
};
