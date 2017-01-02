import React from 'react'
import { View } from 'react-native'

const Section = (props) => {
  const { container } = styles;
  return (
    <View style={container}>
      {props.children}
    </View>
  )
}

const styles = {
  container: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    position: 'relative',
    marginBottom: 10,
  }
};

export { Section }
