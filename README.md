# vuex-persist-indexeddb

Persist and rehydrate your [Vuex](http://vuex.vuejs.org/) state between page reloads.

<hr />

## Install

```bash
npm install --save vuex-persist-indexeddb
```

## Usage

### vuex-persist-indexeddb 3.x (for Vuex 3 and Vue 2)

```js
import Vuex from "vuex";
import createPersistedState from "vuex-persist-indexeddb";

const store = new Vuex.Store({
  // ...
  plugins: [createPersistedState()],
});
```

### vuex-persist-indexeddb 4.x (for Vuex 4 and Vue 3)

```js
import { createStore } from "vuex";
import createPersistedState from "vuex-persist-indexeddb";

const store = createStore({
  // ...
  plugins: [createPersistedState()],
});
```

### Example with Vuex modules

New plugin instances can be created in separate files, but must be imported and added to plugins object in the main Vuex file.

```js
/* module.js */
export const dataStore = {
  state: {
    data: ['js']
  }
}

/* store.js */
import { dataStore } from './module'

const dataState = createPersistedState({
  paths: ['dataStore.data']
})

export new Vuex.Store({
  modules: {
    dataStore
  },
  plugins: [dataState]
})
```

### Example use reducer

```js
/* module.js */
export const dataStore = {
  state: {
    user: {
      name: 'jason',
      sex: 'male',
      phone: '132****1325'
    },
    books: ['js', 'java', 'python']
  }
}

/* store.js */
import { dataStore } from './module'

const dataState = createPersistedState({
  reducer(state, paths) {
      return {
          user: {
            name: state.dataStore.user.name,
            sex: state.dataStore.user.sex
          }
      };
  }
})

export new Vuex.Store({
  modules: {
    dataStore
  },
  plugins: [dataState]
})
```

### Example with Nuxt.js

It is possible to use vuex-persist-indexeddb with Nuxt.js. It must be included as a NuxtJS plugin:

#### With local storage (client-side only)

```javascript
// nuxt.config.js

...
/*
 * Naming your plugin 'xxx.client.js' will make it execute only on the client-side.
 * https://nuxtjs.org/guide/plugins/#name-conventional-plugin
 */
plugins: [{ src: '~/plugins/persistedState.client.js' }]
...
```

```javascript
// ~/plugins/persistedState.client.js

import createPersistedState from 'vuex-persist-indexeddb'

export default ({store}) => {
  createPersistedState({
    key: 'yourkey',
    paths: [...]
    ...
  })(store)
}
```

## API

### `createPersistedState([options])`

Creates a new instance of the plugin with the given options. The following options
can be provided to configure the plugin for your specific needs:

- `key <String>`: The key to store the persisted state under. Defaults to `vuex`.
- `paths <Array>`: An array of any paths to partially persist the state. If no paths are given, the complete state is persisted. If an empty array is given, no state is persisted. Paths must be specified using dot notation. If using modules, include the module name. eg: "auth.user" Defaults to `undefined`.
- `reducer <Function>`: A function that will be called to reduce the state to persist based on the given paths. Defaults to include the values.
- `subscriber <Function>`: A function called to setup mutation subscription. Defaults to `store => handler => store.subscribe(handler)`.

- `filter <Function>`: A function that will be called to filter any mutations which will trigger `setState` on storage eventually. Defaults to `() => true`.
- `overwrite <Boolean>`: When rehydrating, whether to overwrite the existing state with the output from `getState` directly, instead of merging the two objects with `deepmerge`. Defaults to `false`.
- `arrayMerger <Function>`: A function for merging arrays when rehydrating state. Defaults to `function (store, saved) { return saved }` (saved state replaces supplied state).
- `rehydrated <Function>`: A function that will be called when the rehydration is finished. Useful when you are using Nuxt.js, which the rehydration of the persisted state happens asynchronously. Defaults to `store => {}`
- `fetchBeforeUse <Boolean>`: A boolean indicating if the state should be fetched from storage before the plugin is used. Defaults to `false`.


### ⚠️ LocalForage ⚠️

As it maybe seems at first sight, it's not possible to pass a [LocalForage](https://github.com/localForage/localForage) instance as `storage` property. This is due the fact that all getters and setters must be synchronous and [LocalForage's methods](https://github.com/localForage/localForage#callbacks-vs-promises) are asynchronous.

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for more information on what has changed recently.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://robinvdvleuten.nl"><img src="https://avatars3.githubusercontent.com/u/238295?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Robin van der Vleuten</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=robinvdvleuten" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=robinvdvleuten" title="Documentation">📖</a> <a href="#infra-robinvdvleuten" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=robinvdvleuten" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/zweizeichen"><img src="https://avatars1.githubusercontent.com/u/654071?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sebastian</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=zweizeichen" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=zweizeichen" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/boris-graeff"><img src="https://avatars1.githubusercontent.com/u/3204379?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Boris Graeff</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=boris-graeff" title="Code">💻</a></td>
    <td align="center"><a href="http://ciceropablo.github.io"><img src="https://avatars3.githubusercontent.com/u/174275?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Cícero Pablo</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=ciceropablo" title="Documentation">📖</a></td>
    <td align="center"><a href="https://gatwal.com"><img src="https://avatars1.githubusercontent.com/u/7547554?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gurpreet Atwal</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=gurpreetatwal" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://jcubed.me"><img src="https://avatars0.githubusercontent.com/u/43069023?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jakub Koralewski</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=JakubKoralewski" title="Code">💻</a></td>
    <td align="center"><a href="http://jankeesvw.com"><img src="https://avatars0.githubusercontent.com/u/167882?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jankees van Woezik</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=jankeesvw" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://randomcodetips.com"><img src="https://avatars2.githubusercontent.com/u/8638243?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jofferson Ramirez Tiquez</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=jofftiquez" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/DevoidCoding"><img src="https://avatars1.githubusercontent.com/u/21159634?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jordan Deprez</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=DevoidCoding" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/juanvillegas"><img src="https://avatars3.githubusercontent.com/u/773149?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Juan Villegas</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=juanvillegas" title="Documentation">📖</a></td>
    <td align="center"><a href="http://jrast.ch"><img src="https://avatars3.githubusercontent.com/u/146369?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jürg Rast</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=jrast" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/antixrist"><img src="https://avatars3.githubusercontent.com/u/2387592?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kartashov Alexey</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=antixrist" title="Code">💻</a></td>
    <td align="center"><a href="http://twitter.com/LeonardPauli"><img src="https://avatars0.githubusercontent.com/u/1329834?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Leonard Pauli</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=leonardpauli" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=leonardpauli" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/nelsliu9121"><img src="https://avatars2.githubusercontent.com/u/1268682?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nelson Liu</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=nelsliu9121" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=nelsliu9121" title="Documentation">📖</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=nelsliu9121" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/NLNicoo"><img src="https://avatars2.githubusercontent.com/u/6526666?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nico</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=NLNicoo" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=NLNicoo" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://www.qkdreyer.dev"><img src="https://avatars3.githubusercontent.com/u/717869?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Quentin Dreyer</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=qkdreyer" title="Code">💻</a></td>
    <td align="center"><a href="http://raphaelsaunier.com"><img src="https://avatars2.githubusercontent.com/u/170256?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Raphael Saunier</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=raphaelsaunier" title="Code">💻</a></td>
    <td align="center"><a href="http://rodneyrehm.de"><img src="https://avatars3.githubusercontent.com/u/186837?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Rodney Rehm</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=rodneyrehm" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=rodneyrehm" title="Tests">⚠️</a></td>
    <td align="center"><a href="http://wongyouth.github.io"><img src="https://avatars1.githubusercontent.com/u/944583?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ryan Wang</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=wongyouth" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=wongyouth" title="Documentation">📖</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=wongyouth" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://atinux.com"><img src="https://avatars2.githubusercontent.com/u/904724?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Sébastien Chopin</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=Atinux" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/zgayjjf"><img src="https://avatars1.githubusercontent.com/u/24718872?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jeffjing</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=zgayjjf" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/macarthuror"><img src="https://avatars0.githubusercontent.com/u/24395219?v=4?s=100" width="100px;" alt=""/><br /><sub><b>macarthuror</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=macarthuror" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/gangsthub"><img src="https://avatars2.githubusercontent.com/u/6775220?s=460&v=4?s=100" width="100px;" alt=""/><br /><sub><b>Paul Melero</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=gangsthub" title="Documentation">📖</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=gangsthub" title="Code">💻</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=gangsthub" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/WTDuck"><img src="https://avatars0.githubusercontent.com/u/16686729?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Guillaume da Silva</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=WTDuck" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/SanterreJo"><img src="https://avatars2.githubusercontent.com/u/6465769?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jonathan Santerre</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=SanterreJo" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/fabiofdsantos/"><img src="https://avatars3.githubusercontent.com/u/8303937?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Fábio Santos</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=fabiofdsantos" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/robertgr991"><img src="https://avatars0.githubusercontent.com/u/36689800?v=4?s=100" width="100px;" alt=""/><br /><sub><b>robertgr991</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=robertgr991" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/YuraKolesnikov"><img src="https://avatars3.githubusercontent.com/u/28485518?v=4?s=100" width="100px;" alt=""/><br /><sub><b>JurijsKolesnikovs</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=YuraKolesnikov" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://davidsbond.github.io"><img src="https://avatars3.githubusercontent.com/u/6227720?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David Bond</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=davidsbond" title="Documentation">📖</a></td>
    <td align="center"><a href="http://www.freekvanrijt.nl"><img src="https://avatars1.githubusercontent.com/u/417416?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Freek van Rijt</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=FreekVR" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/yachaka"><img src="https://avatars2.githubusercontent.com/u/8074336?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ilyes Hermellin</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=yachaka" title="Code">💻</a></td>
    <td align="center"><a href="http://www.inventage.com"><img src="https://avatars1.githubusercontent.com/u/63866?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Peter Siska</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=peschee" title="Documentation">📖</a></td>
    <td align="center"><a href="http://adm1t.github.io"><img src="https://avatars2.githubusercontent.com/u/26100455?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Dmitry Filippov</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=adm1t" title="Documentation">📖</a></td>
    <td align="center"><a href="https://retailify.de"><img src="https://avatars0.githubusercontent.com/u/5236353?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thomas Meitz</b></sub></a><br /><a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=retailify" title="Documentation">📖</a> <a href="https://github.com/robinvdvleuten/vuex-persistedstate/commits?author=retailify" title="Tests">⚠️</a></td>
  </tr>
</table>
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

The MIT License (MIT). Please see [License File](LICENSE) for more information.
