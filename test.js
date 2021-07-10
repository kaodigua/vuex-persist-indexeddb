import Vue from "vue";
import Vuex from "vuex";
import localforage from 'localforage';
import createPersistedState from "./";

// Do not show the production tip while running tests.
Vue.config.productionTip = false;

Vue.use(Vuex);

const storage = localforage
storage.config({
    name: 'vuex'
});

it("can be created with the default options", () => {
  expect(() => createPersistedState()).not.toThrow();
});

it("replaces store's state and subscribes to changes when initializing", async () => {
  await storage.clear()
  await storage.setItem("persisted", "json");

  const store = new Vuex.Store({ state: { original: "state" } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState();
  await plugin(store);
  
  expect(store.replaceState).toBeCalledWith({
    original: "state",
    persisted: "json",
  });
  expect(store.subscribe).toBeCalled();
});

// it("does not replaces store's state when receiving invalid JSON", async () => {
//   await storage.setItem("vuex", "<invalid JSON>");

//   const store = new Vuex.Store({ state: { nested: { original: "state" } } });
//   store.replaceState = jest.fn();
//   store.subscribe = jest.fn();

//   const plugin = createPersistedState();
//   await plugin(store);

//   expect(store.replaceState).not.toBeCalled();
//   expect(store.subscribe).toBeCalled();
// });

it("does not replaces store's state when receiving nothing", async () => {
  await storage.clear()

  const store = new Vuex.Store({ state: { nested: { original: "state" } } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState();
  await plugin(store);

  expect(store.replaceState).not.toBeCalled();
  expect(store.subscribe).toBeCalled();
});

it("respects nested values when it replaces store's state on initializing", async () => {
  await storage.clear()
  await storage.setItem("persisted", "json");

  const store = new Vuex.Store({ state: { original: "state" } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState();
  await plugin(store);

  expect(store.replaceState).toBeCalledWith({
    original: "state",
    persisted: "json",
  });
  expect(store.subscribe).toBeCalled();
});

it("should persist the changed partial state", async () => {
  await storage.clear()
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({ paths: ["changed"] });
  await plugin(store);

  await store._subscribers[0]("mutation", { changed: "state" });
  const persistVal = await storage.getItem("changed");
  expect(persistVal).toBe("state");
});

it("persist the changed partial state under a configured key", async () => {
  const storage = localforage;
  storage.config({
    name: 'custom'
  });
  await storage.clear()
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({
    key: "custom",
    paths: ["changed"],
  });
  await plugin(store);

  await store._subscribers[0]("mutation", { changed: "state" });
  
  const persistVal = await storage.getItem("changed");
  expect(persistVal).toBe("state");
});

it("persist the changed state when no paths are given", async () => {
  await storage.clear()
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState();
  await plugin(store);

  await store._subscribers[0]("mutation", { changed: "state" });

  const persistVal = await storage.getItem("changed");
  expect(persistVal).toBe("state");
});

it("persist the changed partial state under a nested path", async () => {
  await storage.clear()
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({
    paths: ["foo.bar", "bar"],
  });
  await plugin(store);

  await store._subscribers[0]("mutation", { foo: { bar: "baz" }, bar: "baz" });

  const persistValFoo = await storage.getItem("foo");
  const persistValBar = await storage.getItem("bar");
  expect(persistValFoo).toStrictEqual({ bar: "baz" });
  expect(persistValBar).toBe("baz");
});

it("should not persist whole store if paths array is empty", async () => {
  await storage.clear()
  const store = new Vuex.Store({
    state: { original: "state" },
  });

  const plugin = createPersistedState({ paths: [] });
  await plugin(store);

  await store._subscribers[0]("mutation", { changed: "state" });

  const persistVal = await storage.getItem("changed");
  expect(persistVal).toBe(null);
});

it("should not persist null values", async () => {
  await storage.clear()
  const store = new Vuex.Store({
    state: { alpha: { name: null, bravo: { name: null } } },
  });

  const plugin = createPersistedState({
    paths: ["alpha.name", "alpha.bravo.name"],
  });

  await plugin(store);

  await store._subscribers[0]("mutation", { charlie: { name: "charlie" } });

  const persistVal = await storage.getItem("alpha");
  expect(persistVal).toStrictEqual({ bravo: {} });
});

it("should not merge array values when rehydrating by default", async () => {
  await storage.clear()
  await storage.setItem("persisted", ["json"]);

  const store = new Vuex.Store({ state: { persisted: ["state"] } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState();
  await plugin(store);

  expect(store.replaceState).toBeCalledWith({
    persisted: ["json"],
  });

  expect(store.subscribe).toBeCalled();
});

it("should not clone circular objects when rehydrating", async () => {
  await storage.clear()
  const circular = { foo: "bar" };
  circular.foo = circular;

  await storage.setItem("persisted", "baz");

  const store = new Vuex.Store({ state: { circular } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState();
  await plugin(store);

  expect(store.replaceState).toBeCalledWith({
    circular,
    persisted: "baz",
  });

  expect(store.subscribe).toBeCalled();
});

it("should apply a custom arrayMerger function", async () => {
  await storage.clear()
  await storage.setItem("persisted", [1, 2]);

  const store = new Vuex.Store({ state: { persisted: [1, 2, 3] } });
  store.replaceState = jest.fn();
  store.subscribe = jest.fn();

  const plugin = createPersistedState({
    arrayMerger: function (store, saved) {
      return ["hello!"];
    },
  });
  await plugin(store);

  expect(store.replaceState).toBeCalledWith({
    persisted: ["hello!"],
  });

  expect(store.subscribe).toBeCalled();
});

// it("rehydrates store's state through the configured getter", async () => {
//   await storage.clear()

//   const store = new Vuex.Store({ state: {} });
//   store.replaceState = jest.fn();

//   const plugin = createPersistedState({
//     getState: () => ({ getter: "item" }),
//   });
//   await plugin(store);

//   expect(store.replaceState).toBeCalledWith({ getter: "item" });
// });

// it("persist the changed state back through the configured setter", async () => {
//   await storage.clear()
//   expect.assertions(1);

//   const store = new Vuex.Store({ state: {} });

//   const plugin = createPersistedState({
//     setState: (key, state) => {
//       expect(state).toEqual({ setter: "item" });
//     },
//   });

//   await plugin(store);

//   await store._subscribers[0]("mutation", { setter: "item" });
// });

it("uses the configured reducer when persisting the state", async () => {
  await storage.clear()
  const store = new Vuex.Store({ state: {} });

  const customReducer = jest.fn();

  const plugin = createPersistedState({
    paths: ["custom"],
    reducer: customReducer,
  });
  await plugin(store);

  await store._subscribers[0]("mutation", { custom: "value" });

  expect(customReducer).toBeCalledWith({ custom: "value" }, ["custom"]);
});

it("filters to specific mutations", async () => {
  await storage.clear()
  const store = new Vuex.Store({ state: {} });

  const plugin = createPersistedState({
    filter: (mutation) => ["filter"].indexOf(mutation) !== -1,
  });
  await plugin(store);

  await store._subscribers[0]("mutation", { changed: "state" });

  let persistVal = await storage.getItem("changed");
  expect(persistVal).toBeNull();

  await store._subscribers[0]("filter", { changed: "state" });
  persistVal = await storage.getItem("changed");

  expect(persistVal).toBe("state");
});

it("should call rehydrated callback once the state is replaced", async () => {
  await storage.clear()
  await storage.setItem("persisted", "json");

  const store = new Vuex.Store({ state: { original: "state" } });
  const rehydrated = jest.fn();

  const plugin = createPersistedState({ rehydrated });
  await plugin(store);

  expect(rehydrated).toBeCalledWith(store);
});

it("should call rehydrated if the replacement executed asynchronously", async () => {
  await storage.clear()
  jest.useFakeTimers();

  await storage.setItem("persisted", "json");

  setTimeout(() => {
    createPersistedState({ rehydrated })(store);
  }, 600);
  const store = new Vuex.Store({ state: { original: "state" } });
  const rehydrated = jest.fn();

  jest.runAllTimers();
  const plugin = createPersistedState({ rehydrated });
  await plugin(store);

  expect(rehydrated).toBeCalled();
  const rehydratedStore = rehydrated.mock.calls[0][0];
  expect(rehydratedStore.state.persisted).toBe("json");
});

it("fetches state from storage when the plugin is used by default", async () => {
  await storage.clear()
  await storage.setItem("persisted", "before");

  const plugin = createPersistedState();

  const store = new Vuex.Store();
  store.replaceState = jest.fn();

  await storage.setItem("persisted", "after");

  await plugin(store);

  expect(store.replaceState).toBeCalledWith({
    persisted: "after",
  });
});

it("fetches state from storage before the plugin is used", async () => {
  await storage.clear()
  await storage.setItem("persisted", "before");

  const plugin = createPersistedState({ fetchBeforeUse: true });

  const store = new Vuex.Store();
  store.replaceState = jest.fn();

  await storage.setItem("persisted", "after");

  await plugin(store);

  expect(store.replaceState).toBeCalledWith({
    persisted: "before",
  });
});

// it("throws specific error if assertion throws error on initializing plugin", async () => {
//   await storage.clear()
//   const errorMessage = "no storage space left";
//   const assertStorage = () => {
//     throw new Error(errorMessage);
//   };
//   expect(() => createPersistedState({ assertStorage })).toThrow(errorMessage);
// });
