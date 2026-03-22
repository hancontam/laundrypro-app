// ─── Global Text wrapper — ensures Plus Jakarta Sans everywhere ──
// NativeWind doesn't inherit fontFamily like CSS web.
// Wrap all Text in AppText so SPEC_DESIGN §3.1 is enforced.
import React from 'react';
import { Text } from 'react-native';
export default function AppText({ style, ...props }) {
    return (<Text {...props} style={[{ fontFamily: 'PlusJakartaSans_400Regular' }, style]}/>);
}
