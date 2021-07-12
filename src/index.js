import merge from "deepmerge";
import * as shvl from "shvl";
import localforage from "localforage";
import _ from "lodash";
/**
 * 
 * @param {Object} options : {
 * key?: string;
 * paths?: string[];
 * reducer?: (state: State, paths: string[]) => object;
 * subscriber?: (
 *   store: Store<State>
 *   ) => (handler: (mutation: any, state: State) => void) => void;
 * filter?: (mutation: MutationPayload) => boolean;
 * arrayMerger?: (state: any[], saved: any[]) => any;
 * rehydrated?: (store: Store<State>) => void;
 * fetchBeforeUse?: boolean;
 * overwrite?: boolean;
 * }
 * @returns function
 */
export default function (options) {
  options = options || {};

  const key = options.key || "vuex";

  localforage.config({
    name: key,
  });
  const storage = localforage;
  let prevState;

  function getState(storage) {
    let result = {};
    return storage
      .iterate((value, key) => {
        result[key] = value;
      })
      .then(() => {
        return result;
      })
      .catch(() => {
        return result;
      });
  }

  function filter() {
    return true;
  }

  function getSubObjects(obj) {
    obj = obj || {};
    return Object.keys(obj).map((key) => ({ key, value: obj[key] }));
  }

  function setState(state, storage) {
    let nextState = _.cloneDeep(state);
    const preStates = getSubObjects(prevState);
    const states = getSubObjects(state);

    const preDiffNewArr = _.differenceWith(preStates, states, _.isEqual);
    const newDiffPre = _.differenceWith(states, preStates, _.isEqual);
    const promises1 = preDiffNewArr.map((item) => {
      return state[item.key]
        ? storage.setItem(item.key, state[item.key])
        : storage.removeItem(item.key); // 新state 是否已经移除相应的key
    });
    const promises2 = newDiffPre.map((item) => {
      return storage.setItem(item.key, state[item.key]);
    });

    prevState = nextState;
    return Promise.all([...promises1, ...promises2]);
  }

  function reducer(state, paths) {
    return Array.isArray(paths)
      ? paths.reduce(function (substate, path) {
          return shvl.set(substate, path, shvl.get(state, path));
        }, {})
      : state;
  }

  function subscriber(store) {
    return function (handler) {
      return store.subscribe(handler);
    };
  }

  const fetchSavedState = () => getState(storage);

  let savedStatePromise;

  if (options.fetchBeforeUse) {
    savedStatePromise = fetchSavedState();
  }

  return async function (store) {
    if (!options.fetchBeforeUse) {
      savedStatePromise = fetchSavedState();
    }

    const savedState = await savedStatePromise;
    if (Object.keys(savedState).length > 0) {
      store.replaceState(
        options.overwrite
          ? savedState
          : merge(store.state, savedState, {
              arrayMerge:
                options.arrayMerger ||
                function (store, saved) {
                  return saved;
                },
              clone: false,
            })
      );
      (options.rehydrated || function () {})(store);
    }

    prevState = savedState;

    (options.subscriber || subscriber)(store)(async function (mutation, state) {
      if ((options.filter || filter)(mutation)) {
        await setState(
          (options.reducer || reducer)(state, options.paths),
          storage
        );
      }
    });
  };
}
