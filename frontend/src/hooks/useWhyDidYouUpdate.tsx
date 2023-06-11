import { useEffect, useRef } from 'react';

/**
 * A custom React hook that logs any changes to the props of a component.
 *
 * @param {string} name - The name of the component to track.
 * @param {Record<string, any>} props - The props object to track for changes.
 * @returns {void}
 */

// example -> useWhyDidYouUpdate('Payments', { isResident, authUser, connections });

interface FromTo {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  to: any;
}

type Changes = Record<string, FromTo>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericProps = Record<string, any>;

// TypeScript adaptation of https://usehooks.com/useWhyDidYouUpdate/
function useWhyDidYouUpdate(name: string, props: GenericProps): void {
  // Get a mutable ref object where we can store props ...
  // ... for comparison next time this hook runs.
  const previousProps = useRef<GenericProps>(props);

  //console.log(previousProps, previousProps);

  useEffect(() => {
    if (previousProps && previousProps.current) {
      // Get all keys from previous and current props
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      // Use this object to keep track of changed props
      const changes: Changes = {};
      // Iterate through keys
      allKeys.forEach((key) => {
        // If previous is different from current
        if (previousProps.current[key] !== props[key]) {
          // Add to changesObj
          changes[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changes).length) {
        /* eslint-disable-next-line  no-console */
        console.log('[why-did-you-update]', name, changes);
      }
    }

    // Finally update previousProps with current props for next hook call
    previousProps.current = props;
  });
}

export default useWhyDidYouUpdate;
