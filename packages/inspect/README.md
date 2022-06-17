# react-native-xstate-inspect

## Install
```sh
yarn add react-native-xstate-inspect
```

To use, import and call the `inspect` function at the root of your project.

```js
import { inspect } from "react-native-flipper-xstate";

if (__DEV__) {
  inspect();
}
```

You also must specify the `devTools` option when creating your machines. Here is an example using the `useMachine` hook.

```js
const [current, send] = createMachine(machine, { devTools: true });
```
