# rn-xstate-inspect

This packages allows React Native apps to use [Flipper](https://fbflipper.com/) to visualize and interact with [xstate](https://xstate.js.org/docs/) machines.

### Dependencies

This package depends on the native package [React Native Flipper](https://github.com/facebook/flipper/tree/main/react-native/react-native-flipper), so you will have to recompile the native apps before using this plugin.

## Usage

### Install the [Flipper plugin](https://github.com/ericadamski/flipper-plugin-xstate-inspect/tree/main/packages/flipper-plugin) on your desktop app

### Install the package
```sh
yarn add react-native-xstate-inspect
```

To use, simply import and call the `inspect` function at the root of your project (index.js) You will only want to do this in Debug/Dev builds.

```js
import { inspect } from "react-native-xstate-inspect";

if (__DEV__) {
  inspect();
}
```

You also must specify the `devTools` option when creating your machines. Here is an example using the `useMachine` hook.

```js
const [current, send] = createMachine(machine, { devTools: true });
```
