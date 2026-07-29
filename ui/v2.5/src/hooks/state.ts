import React, { useCallback, Dispatch, SetStateAction } from "react";
import isEqual from "lodash-es/isEqual";

// useStableValue returns the given value, only changing the returned identity when
// the contents of the value change.
// Objects and arrays within graphql query results are not guaranteed to keep their
// identity when a query is re-read from the apollo cache: the cache reuses the
// previously built result objects, but those are memoised in a bounded cache, so a
// re-read can rebuild an identical value as a new object. Use this hook when such a
// value is used as an effect dependency, so that the effect only runs when the value
// has actually changed.
export function useStableValue<T>(value: T): T {
  const ref = React.useRef<T>(value);
  if (!isEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
}

// useInitialState is an extension of the useState hook.
// It maintains a state, but additionally exposes a setInitialState function.
// When setInitialState is called, the current state is only updated if the current
// state is unchanged from the initial state. This means that the current state will
// only be updated if explicitly called, or if the initial state is changed and the current
// state is not dirty.
export function useInitialState<T>(
  initialValue: T
): [T, Dispatch<SetStateAction<T>>, Dispatch<T>] {
  const [, setInitialValueInternal] = React.useState<T>(initialValue);
  const [value, setValue] = React.useState<T>(initialValue);

  const setInitialValue = useCallback((v: T) => {
    setInitialValueInternal((currentInitial) => {
      if (v === currentInitial) {
        return currentInitial;
      }

      setValue((currentValue) => {
        if (currentInitial === currentValue) {
          return v;
        }

        return currentValue;
      });

      return v;
    });
  }, []);

  return [value, setValue, setInitialValue];
}

// useMemoOnce is a hook that returns a value once the ready flag is set to true.
// The value is only set once, and will not be updated once it has been set.
// biome-ignore-start lint/correctness/useExhaustiveDependencies: intentionally not using array literal
export function useMemoOnce<T>(
  fn: () => [T, boolean],
  deps: React.DependencyList
) {
  const [storedValue, setStoredValue] = React.useState<T>();
  const isFirst = React.useRef(true);

  React.useEffect(() => {
    if (isFirst.current) {
      const [v, ready] = fn();
      if (ready) {
        setStoredValue(v);
        isFirst.current = false;
      }
    }
  }, deps);

  return storedValue;
}
// biome-ignore-end lint/correctness/useExhaustiveDependencies: intentionally not using array literal */

// useCompare is a hook that returns true if the value has changed since the last render.
export function useCompare<T>(val: T) {
  const prevVal = usePrevious(val);
  return prevVal !== val;
}

// usePrevious is a hook that returns the previous value of a variable.
export function usePrevious<T>(value: T) {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
