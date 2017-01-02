import React from 'react';
import { View } from 'react-native';

const CardSection = (props) => {
  const { container } = styles;
  return (
    <View style={container}>
      {props.children}
    </View>
  );
};

const styles = {
  container: {
    borderBottomWidth: 1,
    padding: 5,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    position: 'relative',
    borderColor: '#DDD',
    backgroundColor: '#FFF' 
  }
};

export { CardSection };
